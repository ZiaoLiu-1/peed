from flask import Blueprint, request, jsonify
from src.models.user import User, TrainingRecord, Achievement, UserAchievement, db
from datetime import datetime, date, timedelta
from sqlalchemy import func
import base64
import os

user_bp = Blueprint('user', __name__)

@user_bp.route('/auth/register', methods=['POST'])
def register():
    """用户注册"""
    data = request.get_json()
    
    if not data or 'username' not in data:
        return jsonify({'error': 'Missing username'}), 400
    
    # 检查用户名是否已存在
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    # 检查邮箱是否已存在（如果提供了邮箱）
    if data.get('email') and User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # 创建新用户
    user = User(
        username=data['username'],
        email=data.get('email'),
        nickname=data.get('nickname'),
        bio=data.get('bio')
    )
    
    try:
        db.session.add(user)
        db.session.flush()  # 获取用户ID
        
        # 初始化用户成就
        achievements = Achievement.query.all()
        for achievement in achievements:
            user_achievement = UserAchievement(
                user_id=user.id,
                achievement_id=achievement.id,
                progress=0,
                unlocked=False
            )
            db.session.add(user_achievement)
        
        db.session.commit()
        return jsonify(user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create user'}), 500

@user_bp.route('/auth/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.get_json()
    
    if not data or 'username' not in data:
        return jsonify({'error': 'Missing username'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # 更新最后登录时间
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    return jsonify(user.to_dict(include_wallet=True)), 200

@user_bp.route('/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    """获取用户完整个人资料"""
    user = User.query.get_or_404(user_id)
    
    # 计算统计数据
    stats = get_user_stats(user_id)
    
    # 获取最近训练记录
    recent_training = TrainingRecord.query.filter_by(user_id=user_id)\
        .order_by(TrainingRecord.created_at.desc())\
        .limit(10).all()
    
    # 获取用户成就
    user_achievements = UserAchievement.query.filter_by(user_id=user_id)\
        .join(Achievement)\
        .order_by(UserAchievement.unlocked.desc(), Achievement.target_value).all()
    
    profile_data = user.to_dict(include_wallet=True)
    profile_data.update({
        'stats': stats,
        'recent_training': [record.to_dict() for record in recent_training],
        'achievements': [ua.to_dict() for ua in user_achievements]
    })
    
    return jsonify(profile_data), 200

@user_bp.route('/profile/<int:user_id>', methods=['PUT'])
def update_profile(user_id):
    """更新用户个人资料"""
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # 更新允许的字段
    allowed_fields = ['username', 'nickname', 'bio', 'avatar_url', 'email']
    
    for field in allowed_fields:
        if field in data:
            if field == 'email' and data[field]:
                # 检查邮箱是否已被其他用户使用
                existing_user = User.query.filter_by(email=data[field]).filter(User.id != user_id).first()
                if existing_user:
                    return jsonify({'error': 'Email already exists'}), 400
            elif field == 'username' and data[field]:
                # 检查用户名是否已被其他用户使用
                existing_user = User.query.filter_by(username=data[field]).filter(User.id != user_id).first()
                if existing_user:
                    return jsonify({'error': 'Username already exists'}), 400
            setattr(user, field, data[field])
    
    user.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile'}), 500

@user_bp.route('/profile/<int:user_id>/avatar', methods=['POST'])
def upload_avatar(user_id):
    """上传头像"""
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if not data or 'avatar_data' not in data:
        return jsonify({'error': 'Missing avatar data'}), 400
    
    try:
        # 验证base64数据
        avatar_data = data['avatar_data']
        if not avatar_data.startswith('data:image/'):
            return jsonify({'error': 'Invalid image format'}), 400
        
        user.avatar_url = avatar_data
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'avatar_url': user.avatar_url}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to upload avatar'}), 500

@user_bp.route('/wallet/<int:user_id>', methods=['POST'])
def connect_wallet(user_id):
    """连接钱包"""
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if not data or 'wallet_address' not in data or 'wallet_type' not in data:
        return jsonify({'error': 'Missing wallet information'}), 400
    
    # 检查钱包地址是否已被其他用户使用
    existing_user = User.query.filter_by(wallet_address=data['wallet_address'])\
        .filter(User.id != user_id).first()
    if existing_user:
        return jsonify({'error': 'Wallet already connected to another account'}), 400
    
    user.wallet_address = data['wallet_address']
    user.wallet_type = data['wallet_type']
    user.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({
            'wallet_address': user.wallet_address,
            'wallet_type': user.wallet_type
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to connect wallet'}), 500

@user_bp.route('/wallet/<int:user_id>', methods=['DELETE'])
def disconnect_wallet(user_id):
    """断开钱包连接"""
    user = User.query.get_or_404(user_id)
    
    user.wallet_address = None
    user.wallet_type = None
    user.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({'message': 'Wallet disconnected successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to disconnect wallet'}), 500

@user_bp.route('/stats/<int:user_id>', methods=['GET'])
def get_user_stats_api(user_id):
    """获取用户统计数据"""
    User.query.get_or_404(user_id)  # 验证用户存在
    stats = get_user_stats(user_id)
    return jsonify(stats), 200

def get_user_stats(user_id):
    """计算用户统计数据的辅助函数"""
    # 总训练次数
    total_records = TrainingRecord.query.filter_by(user_id=user_id).count()
    
    # 总训练时间（分钟）
    total_duration = db.session.query(func.sum(TrainingRecord.total_duration))\
        .filter_by(user_id=user_id).scalar() or 0
    total_time_hours = round(total_duration / 3600, 1)
    
    # 计算连续天数
    current_streak = calculate_streak(user_id)
    
    # 本周训练次数
    week_start = date.today() - timedelta(days=date.today().weekday())
    weekly_count = TrainingRecord.query.filter_by(user_id=user_id)\
        .filter(TrainingRecord.session_date >= week_start).count()
    
    # 按难度统计
    difficulty_stats = db.session.query(
        TrainingRecord.difficulty,
        func.count(TrainingRecord.id),
        func.sum(TrainingRecord.total_duration)
    ).filter_by(user_id=user_id).group_by(TrainingRecord.difficulty).all()
    
    difficulty_breakdown = {}
    for difficulty, count, duration in difficulty_stats:
        difficulty_breakdown[difficulty] = {
            'count': count,
            'total_duration': duration or 0
        }
    
    return {
        'total_exercises': total_records,
        'current_streak': current_streak,
        'total_time_hours': total_time_hours,
        'weekly_progress': weekly_count,
        'weekly_goal': 21,  # 默认周目标
        'difficulty_breakdown': difficulty_breakdown,
        'last_training': get_last_training_date(user_id)
    }

def calculate_streak(user_id):
    """计算连续训练天数"""
    # 获取按日期排序的训练记录
    training_dates = db.session.query(TrainingRecord.session_date)\
        .filter_by(user_id=user_id)\
        .distinct()\
        .order_by(TrainingRecord.session_date.desc()).all()
    
    if not training_dates:
        return 0
    
    streak = 0
    current_date = date.today()
    
    for (training_date,) in training_dates:
        if training_date == current_date or training_date == current_date - timedelta(days=1):
            streak += 1
            current_date = training_date - timedelta(days=1)
        else:
            break
    
    return streak

def get_last_training_date(user_id):
    """获取最后训练日期"""
    last_record = TrainingRecord.query.filter_by(user_id=user_id)\
        .order_by(TrainingRecord.created_at.desc()).first()
    
    if last_record:
        return last_record.session_date.isoformat()
    return None

@user_bp.route('/users', methods=['GET'])
def get_users():
    """获取所有用户（管理功能）"""
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """删除用户"""
    user = User.query.get_or_404(user_id)
    
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete user'}), 500 