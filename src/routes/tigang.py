from flask import Blueprint, request, jsonify
from datetime import datetime, date, timedelta
from src.models.user import User, TrainingRecord, Achievement, UserAchievement, db
from sqlalchemy import func

tigang_bp = Blueprint('tigang', __name__)

# 训练记录相关路由
@tigang_bp.route('/training/record', methods=['POST'])
def record_training():
    """记录训练会话"""
    data = request.get_json()
    
    required_fields = ['user_id', 'difficulty', 'sets_completed', 'reps_completed', 'total_duration', 'contract_time', 'relax_time']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # 检查用户是否存在
    user = User.query.get(data['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # 创建训练记录
    training_record = TrainingRecord(
        user_id=data['user_id'],
        difficulty=data['difficulty'],
        sets_completed=data['sets_completed'],
        reps_completed=data['reps_completed'],
        total_duration=data['total_duration'],  # 秒
        contract_time=data['contract_time'],
        relax_time=data['relax_time'],
        session_date=date.today()
    )
    
    try:
        db.session.add(training_record)
        
        # 更新用户最后活动时间
        user.last_login = datetime.utcnow()
        
        # 检查并更新成就
        update_user_achievements(data['user_id'])
        
        db.session.commit()
        return jsonify(training_record.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to record training'}), 500

@tigang_bp.route('/training/history/<int:user_id>', methods=['GET'])
def get_training_history(user_id):
    """获取用户训练历史"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    difficulty = request.args.get('difficulty')
    
    query = TrainingRecord.query.filter_by(user_id=user_id)
    
    # 添加日期过滤
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(TrainingRecord.session_date >= start_date_obj)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
    
    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(TrainingRecord.session_date <= end_date_obj)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
    
    # 添加难度过滤
    if difficulty:
        query = query.filter(TrainingRecord.difficulty == difficulty)
    
    # 分页和排序
    training_records = query.order_by(TrainingRecord.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'training_records': [record.to_dict() for record in training_records.items],
        'total': training_records.total,
        'page': page,
        'per_page': per_page,
        'pages': training_records.pages
    })

@tigang_bp.route('/training/stats/<int:user_id>', methods=['GET'])
def get_training_stats(user_id):
    """获取用户训练统计"""
    User.query.get_or_404(user_id)  # 验证用户存在
    
    # 基础统计
    total_sessions = TrainingRecord.query.filter_by(user_id=user_id).count()
    total_duration = db.session.query(func.sum(TrainingRecord.total_duration))\
        .filter_by(user_id=user_id).scalar() or 0
    
    # 按难度统计
    difficulty_stats = db.session.query(
        TrainingRecord.difficulty,
        func.count(TrainingRecord.id).label('session_count'),
        func.sum(TrainingRecord.sets_completed).label('total_sets'),
        func.sum(TrainingRecord.reps_completed).label('total_reps'),
        func.sum(TrainingRecord.total_duration).label('total_time')
    ).filter_by(user_id=user_id).group_by(TrainingRecord.difficulty).all()
    
    # 按日期统计（最近30天）
    thirty_days_ago = date.today() - timedelta(days=30)
    daily_stats = db.session.query(
        TrainingRecord.session_date,
        func.count(TrainingRecord.id).label('session_count'),
        func.sum(TrainingRecord.total_duration).label('total_time')
    ).filter(
        TrainingRecord.user_id == user_id,
        TrainingRecord.session_date >= thirty_days_ago
    ).group_by(TrainingRecord.session_date).order_by(TrainingRecord.session_date).all()
    
    # 连续天数计算
    streak_days = calculate_training_streak(user_id)
    
    # 本周统计
    week_start = date.today() - timedelta(days=date.today().weekday())
    weekly_sessions = TrainingRecord.query.filter(
        TrainingRecord.user_id == user_id,
        TrainingRecord.session_date >= week_start
    ).count()
    
    # 本月统计
    month_start = date.today().replace(day=1)
    monthly_sessions = TrainingRecord.query.filter(
        TrainingRecord.user_id == user_id,
        TrainingRecord.session_date >= month_start
    ).count()
    
    return jsonify({
        'total_sessions': total_sessions,
        'total_duration_minutes': round(total_duration / 60, 1),
        'streak_days': streak_days,
        'weekly_sessions': weekly_sessions,
        'monthly_sessions': monthly_sessions,
        'difficulty_breakdown': [
            {
                'difficulty': row.difficulty,
                'session_count': row.session_count,
                'total_sets': row.total_sets or 0,
                'total_reps': row.total_reps or 0,
                'total_time_minutes': round((row.total_time or 0) / 60, 1)
            } for row in difficulty_stats
        ],
        'daily_stats': [
            {
                'date': row.session_date.isoformat(),
                'session_count': row.session_count,
                'total_time_minutes': round((row.total_time or 0) / 60, 1)
            } for row in daily_stats
        ]
    })

@tigang_bp.route('/training/leaderboard', methods=['GET'])
def get_training_leaderboard():
    """获取训练排行榜"""
    period = request.args.get('period', 'week')  # week, month, all_time
    limit = request.args.get('limit', 10, type=int)
    
    if period == 'week':
        week_start = date.today() - timedelta(days=date.today().weekday())
        date_filter = TrainingRecord.session_date >= week_start
    elif period == 'month':
        month_start = date.today().replace(day=1)
        date_filter = TrainingRecord.session_date >= month_start
    else:  # all_time
        date_filter = True
    
    # 查询用户排行
    leaderboard_query = db.session.query(
        User.id,
        User.username,
        User.nickname,
        User.avatar_url,
        func.count(TrainingRecord.id).label('session_count'),
        func.sum(TrainingRecord.total_duration).label('total_time'),
        func.sum(TrainingRecord.sets_completed).label('total_sets'),
        func.sum(TrainingRecord.reps_completed).label('total_reps')
    ).join(TrainingRecord).filter(date_filter).group_by(User.id)\
    .order_by(func.count(TrainingRecord.id).desc()).limit(limit)
    
    leaderboard = []
    for rank, row in enumerate(leaderboard_query.all(), 1):
        leaderboard.append({
            'rank': rank,
            'user_id': row.id,
            'username': row.username,
            'nickname': row.nickname,
            'avatar_url': row.avatar_url,
            'session_count': row.session_count,
            'total_time_minutes': round((row.total_time or 0) / 60, 1),
            'total_sets': row.total_sets or 0,
            'total_reps': row.total_reps or 0
        })
    
    return jsonify({
        'period': period,
        'leaderboard': leaderboard
    })

# 成就系统相关路由
@tigang_bp.route('/achievements', methods=['GET'])
def get_achievements():
    """获取所有成就"""
    achievements = Achievement.query.all()
    return jsonify([achievement.to_dict() for achievement in achievements])

@tigang_bp.route('/achievements/<int:user_id>', methods=['GET'])
def get_user_achievements(user_id):
    """获取用户成就"""
    User.query.get_or_404(user_id)  # 验证用户存在
    
    user_achievements = UserAchievement.query.filter_by(user_id=user_id)\
        .join(Achievement)\
        .order_by(UserAchievement.unlocked.desc(), Achievement.target_value).all()
    
    return jsonify([ua.to_dict() for ua in user_achievements])

@tigang_bp.route('/achievements/check/<int:user_id>', methods=['POST'])
def check_achievements(user_id):
    """检查并更新用户成就"""
    User.query.get_or_404(user_id)  # 验证用户存在
    
    updated_achievements = update_user_achievements(user_id)
    
    return jsonify({
        'message': 'Achievements updated',
        'updated_count': len(updated_achievements),
        'updated_achievements': updated_achievements
    })

# 训练配置相关路由
@tigang_bp.route('/training/config', methods=['GET'])
def get_training_configs():
    """获取训练配置"""
    configs = {
        'beginner': {
            'name': '新手级',
            'name_en': 'Beginner',
            'contract_time': 5,
            'relax_time': 5,
            'reps_per_set': 8,
            'sets_count': 2,
            'daily_sessions': 2,
            'description': '适合初学者的轻松训练',
            'description_en': 'Easy training for beginners'
        },
        'intermediate': {
            'name': '入门级',
            'name_en': 'Intermediate',
            'contract_time': 8,
            'relax_time': 8,
            'reps_per_set': 12,
            'sets_count': 3,
            'daily_sessions': 3,
            'description': '中等强度的平衡训练',
            'description_en': 'Moderate intensity balanced training'
        },
        'advanced': {
            'name': '精通级',
            'name_en': 'Advanced',
            'contract_time': 12,
            'relax_time': 6,
            'reps_per_set': 15,
            'sets_count': 4,
            'daily_sessions': 3,
            'description': '高强度的专业训练',
            'description_en': 'High intensity professional training'
        }
    }
    
    return jsonify(configs)

# 全局统计路由
@tigang_bp.route('/stats/global', methods=['GET'])
def get_global_stats():
    """获取全局统计"""
    total_users = User.query.count()
    total_training_sessions = TrainingRecord.query.count()
    total_duration = db.session.query(func.sum(TrainingRecord.total_duration)).scalar() or 0
    
    # 今日活跃用户
    today = date.today()
    today_active_users = db.session.query(User.id).join(TrainingRecord)\
        .filter(TrainingRecord.session_date == today).distinct().count()
    
    # 本周统计
    week_start = date.today() - timedelta(days=date.today().weekday())
    weekly_sessions = TrainingRecord.query.filter(TrainingRecord.session_date >= week_start).count()
    
    return jsonify({
        'total_users': total_users,
        'total_training_sessions': total_training_sessions,
        'total_duration_hours': round(total_duration / 3600, 1),
        'today_active_users': today_active_users,
        'weekly_sessions': weekly_sessions
    })

# 辅助函数
def calculate_training_streak(user_id):
    """计算训练连续天数"""
    # 获取按日期排序的训练记录
    training_dates = db.session.query(TrainingRecord.session_date)\
        .filter_by(user_id=user_id)\
        .distinct()\
        .order_by(TrainingRecord.session_date.desc()).all()
    
    if not training_dates:
        return 0
    
    streak = 0
    current_date = date.today()
    
    # 检查是否今天有训练
    training_date_set = {td[0] for td in training_dates}
    
    for training_date in sorted(training_date_set, reverse=True):
        if training_date == current_date or training_date == current_date - timedelta(days=1):
            streak += 1
            current_date = training_date - timedelta(days=1)
        else:
            break
    
    return streak

def update_user_achievements(user_id):
    """更新用户成就"""
    updated_achievements = []
    
    # 获取用户统计数据
    total_sessions = TrainingRecord.query.filter_by(user_id=user_id).count()
    total_duration = db.session.query(func.sum(TrainingRecord.total_duration))\
        .filter_by(user_id=user_id).scalar() or 0
    streak_days = calculate_training_streak(user_id)
    
    # 获取用户所有成就
    user_achievements = UserAchievement.query.filter_by(user_id=user_id).all()
    
    for ua in user_achievements:
        achievement = ua.achievement
        old_progress = ua.progress
        old_unlocked = ua.unlocked
        
        # 根据成就类型更新进度
        if achievement.category == 'session_count':
            ua.progress = min(total_sessions, achievement.target_value)
        elif achievement.category == 'training_time':
            # 时间成就：目标值为小时数
            hours = total_duration / 3600
            ua.progress = min(int(hours), achievement.target_value)
        elif achievement.category == 'streak_days':
            ua.progress = min(streak_days, achievement.target_value)
        
        # 检查是否解锁
        if not ua.unlocked and ua.progress >= achievement.target_value:
            ua.unlocked = True
            ua.unlocked_at = datetime.utcnow()
            updated_achievements.append(achievement.to_dict())
        
        # 如果有变化则记录
        if ua.progress != old_progress or ua.unlocked != old_unlocked:
            db.session.add(ua)
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise e
    
    return updated_achievements

# 初始化数据路由
@tigang_bp.route('/init-achievements', methods=['POST'])
def init_achievements():
    """初始化成就数据"""
    achievements_data = [
        {
            'name': '初试身手',
            'name_en': 'First Steps',
            'description': '完成你的第一次训练',
            'description_en': 'Complete your first training session',
            'icon': 'Play',
            'category': 'session_count',
            'target_value': 1
        },
        {
            'name': '坚持一周',
            'name_en': '7-Day Streak',
            'description': '连续训练7天',
            'description_en': 'Train for 7 consecutive days',
            'icon': 'Flame',
            'category': 'streak_days',
            'target_value': 7
        },
        {
            'name': '百次达人',
            'name_en': '100 Sessions',
            'description': '完成100次训练',
            'description_en': 'Complete 100 training sessions',
            'icon': 'Trophy',
            'category': 'session_count',
            'target_value': 100
        },
        {
            'name': '千次专家',
            'name_en': '1000 Sessions',
            'description': '完成1000次训练',
            'description_en': 'Complete 1000 training sessions',
            'icon': 'Star',
            'category': 'session_count',
            'target_value': 1000
        },
        {
            'name': '马拉松选手',
            'name_en': 'Marathon Trainer',
            'description': '累计训练时间达到10小时',
            'description_en': 'Accumulate 10 hours of training',
            'icon': 'Clock',
            'category': 'training_time',
            'target_value': 10
        },
        {
            'name': '完美一月',
            'name_en': '30-Day Streak',
            'description': '连续训练30天',
            'description_en': 'Train for 30 consecutive days',
            'icon': 'Target',
            'category': 'streak_days',
            'target_value': 30
        }
    ]
    
    try:
        for achievement_data in achievements_data:
            # 检查成就是否已存在
            existing = Achievement.query.filter_by(name=achievement_data['name']).first()
            if not existing:
                achievement = Achievement(**achievement_data)
                db.session.add(achievement)
        
        db.session.commit()
        return jsonify({'message': 'Achievements initialized successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to initialize achievements'}), 500 