from flask import Blueprint, request, jsonify
from datetime import datetime, date
from src.models.tigang import TigangUser, ExerciseRecord, DailyStats, CommunityPost, Leaderboard, db

tigang_bp = Blueprint('tigang', __name__)

# 用户相关路由
@tigang_bp.route('/users', methods=['GET'])
def get_tigang_users():
    """获取所有提肛用户"""
    users = TigangUser.query.all()
    return jsonify([user.to_dict() for user in users])

@tigang_bp.route('/users', methods=['POST'])
def create_tigang_user():
    """创建提肛用户"""
    data = request.get_json()
    
    if not data or 'username' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # 检查用户是否已存在
    if TigangUser.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    # 创建新用户
    user = TigangUser(
        username=data['username'],
        email=data.get('email'),
        twitter_handle=data.get('twitter_handle'),
        wallet_address=data.get('wallet_address'),
        avatar_emoji=data.get('avatar_emoji', '💪')
    )
    
    try:
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create user'}), 500

@tigang_bp.route('/users/<int:user_id>', methods=['GET'])
def get_tigang_user(user_id):
    """获取提肛用户详情"""
    user = TigangUser.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@tigang_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_tigang_user(user_id):
    """更新提肛用户信息"""
    user = TigangUser.query.get_or_404(user_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # 更新字段
    for field in ['username', 'email', 'twitter_handle', 'wallet_address', 'avatar_emoji']:
        if field in data:
            setattr(user, field, data[field])
    
    user.last_active = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify(user.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update user'}), 500

# 运动记录相关路由
@tigang_bp.route('/exercises', methods=['POST'])
def record_exercise():
    """记录运动"""
    data = request.get_json()
    
    required_fields = ['user_id', 'duration_seconds', 'repetitions', 'phase_type']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # 检查用户是否存在
    user = TigangUser.query.get(data['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # 创建运动记录
    exercise = ExerciseRecord(
        user_id=data['user_id'],
        duration_seconds=data['duration_seconds'],
        repetitions=data['repetitions'],
        phase_type=data['phase_type']
    )
    
    try:
        db.session.add(exercise)
        
        # 更新用户统计
        user.total_exercises += 1
        user.total_time_minutes += data['duration_seconds'] // 60
        user.last_active = datetime.utcnow()
        
        # 更新或创建每日统计
        today = date.today()
        daily_stat = DailyStats.query.filter_by(user_id=data['user_id'], stat_date=today).first()
        if not daily_stat:
            daily_stat = DailyStats(user_id=data['user_id'], stat_date=today)
            db.session.add(daily_stat)
        
        daily_stat.daily_count += 1
        daily_stat.daily_time_minutes += data['duration_seconds'] // 60
        
        db.session.commit()
        return jsonify(exercise.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to record exercise'}), 500

@tigang_bp.route('/exercises/<int:user_id>', methods=['GET'])
def get_user_exercises(user_id):
    """获取用户运动记录"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    exercises = ExerciseRecord.query.filter_by(user_id=user_id).order_by(ExerciseRecord.exercise_time.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'exercises': [exercise.to_dict() for exercise in exercises.items],
        'total': exercises.total,
        'page': page,
        'per_page': per_page,
        'pages': exercises.pages
    })

# 统计相关路由
@tigang_bp.route('/stats/<int:user_id>', methods=['GET'])
def get_user_stats(user_id):
    """获取用户统计"""
    user = TigangUser.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@tigang_bp.route('/stats/global', methods=['GET'])
def get_global_stats():
    """获取全局统计"""
    total_users = TigangUser.query.count()
    total_exercises = db.session.query(db.func.sum(TigangUser.total_exercises)).scalar() or 0
    total_time = db.session.query(db.func.sum(TigangUser.total_time_minutes)).scalar() or 0
    
    return jsonify({
        'total_users': total_users,
        'total_exercises': total_exercises,
        'total_time_minutes': total_time
    })

# 社区相关路由
@tigang_bp.route('/community/today-users', methods=['GET'])
def get_today_users():
    """获取今日用户列表"""
    today = date.today()
    today_users = db.session.query(TigangUser).join(DailyStats).filter(
        DailyStats.stat_date == today,
        DailyStats.daily_count > 0
    ).all()
    
    return jsonify([user.to_dict() for user in today_users])

@tigang_bp.route('/community/posts', methods=['GET'])
def get_community_posts():
    """获取社区动态"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    posts = CommunityPost.query.order_by(CommunityPost.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'posts': [post.to_dict() for post in posts.items],
        'total': posts.total,
        'page': page,
        'per_page': per_page,
        'pages': posts.pages
    })

@tigang_bp.route('/community/posts', methods=['POST'])
def create_community_post():
    """创建社区动态"""
    data = request.get_json()
    
    if not data or 'user_id' not in data or 'content' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # 检查用户是否存在
    user = TigangUser.query.get(data['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # 创建社区动态
    post = CommunityPost(
        user_id=data['user_id'],
        content=data['content'],
        post_type=data.get('post_type', 'general'),
        exercise_count=data.get('exercise_count', 0),
        streak_days=data.get('streak_days', 0)
    )
    
    try:
        db.session.add(post)
        db.session.commit()
        return jsonify(post.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create post'}), 500

# 排行榜相关路由
@tigang_bp.route('/leaderboard/<period_type>', methods=['GET'])
def get_leaderboard(period_type):
    """获取排行榜"""
    if period_type not in ['daily', 'weekly', 'monthly']:
        return jsonify({'error': 'Invalid period type'}), 400
    
    today = date.today()
    rankings = Leaderboard.query.filter_by(period_type=period_type, period_date=today).order_by(
        Leaderboard.rank_position
    ).all()
    
    return jsonify([ranking.to_dict() for ranking in rankings])

# 推特相关路由
@tigang_bp.route('/twitter/bind', methods=['POST'])
def bind_twitter():
    """绑定推特"""
    data = request.get_json()
    
    if not data or 'user_id' not in data or 'twitter_handle' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    user = TigangUser.query.get(data['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.twitter_handle = data['twitter_handle']
    
    try:
        db.session.commit()
        return jsonify({'message': 'Twitter bound successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to bind Twitter'}), 500

@tigang_bp.route('/twitter/share', methods=['POST'])
def share_to_twitter():
    """分享到推特"""
    data = request.get_json()
    
    if not data or 'user_id' not in data or 'content' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    user = TigangUser.query.get(data['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # 这里可以添加实际的推特分享逻辑
    # 目前只是模拟
    return jsonify({'message': 'Shared to Twitter successfully', 'twitter_url': 'https://twitter.com/...'})

# 初始化数据路由
@tigang_bp.route('/init-data', methods=['POST'])
def init_sample_data():
    """初始化示例数据"""
    try:
        # 创建示例用户
        if not TigangUser.query.first():
            sample_users = [
                TigangUser(username='健康达人', avatar_emoji='💪', total_exercises=100, current_streak=7),
                TigangUser(username='运动小王子', avatar_emoji='🏃', total_exercises=50, current_streak=3),
                TigangUser(username='提肛专家', avatar_emoji='🐢', total_exercises=200, current_streak=15)
            ]
            
            for user in sample_users:
                db.session.add(user)
            
            db.session.commit()
        
        return jsonify({'message': 'Sample data initialized successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to initialize data'}), 500 