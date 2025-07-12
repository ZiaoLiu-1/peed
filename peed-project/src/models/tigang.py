from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
from src.models.user import db

class TigangUser(db.Model):
    """提肛用户模型"""
    __tablename__ = 'tigang_users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    twitter_handle = db.Column(db.String(50), unique=True, nullable=True)
    wallet_address = db.Column(db.String(100), unique=True, nullable=True)
    avatar_emoji = db.Column(db.String(10), default='💪')
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_active = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 统计数据
    total_exercises = db.Column(db.Integer, default=0)
    current_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    total_time_minutes = db.Column(db.Integer, default=0)
    
    # 关联关系
    exercise_records = db.relationship('ExerciseRecord', backref='user', lazy=True, cascade='all, delete-orphan')
    daily_stats = db.relationship('DailyStats', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<TigangUser {self.username}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'twitter_handle': self.twitter_handle,
            'wallet_address': self.wallet_address,
            'avatar_emoji': self.avatar_emoji,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_active': self.last_active.isoformat() if self.last_active else None,
            'total_exercises': self.total_exercises,
            'current_streak': self.current_streak,
            'longest_streak': self.longest_streak,
            'total_time_minutes': self.total_time_minutes
        }

class ExerciseRecord(db.Model):
    """提肛运动记录模型"""
    __tablename__ = 'exercise_records'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('tigang_users.id'), nullable=False)
    exercise_date = db.Column(db.Date, default=date.today)
    exercise_time = db.Column(db.DateTime, default=datetime.utcnow)
    duration_seconds = db.Column(db.Integer, nullable=False)  # 运动持续时间（秒）
    repetitions = db.Column(db.Integer, nullable=False)  # 重复次数
    phase_type = db.Column(db.String(20), nullable=False)  # contract, hold, relax
    
    def __repr__(self):
        return f'<ExerciseRecord {self.user_id} - {self.exercise_date}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'exercise_date': self.exercise_date.isoformat() if self.exercise_date else None,
            'exercise_time': self.exercise_time.isoformat() if self.exercise_time else None,
            'duration_seconds': self.duration_seconds,
            'repetitions': self.repetitions,
            'phase_type': self.phase_type
        }

class DailyStats(db.Model):
    """每日统计模型"""
    __tablename__ = 'daily_stats'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('tigang_users.id'), nullable=False)
    stat_date = db.Column(db.Date, default=date.today)
    daily_count = db.Column(db.Integer, default=0)  # 当日完成次数
    daily_time_minutes = db.Column(db.Integer, default=0)  # 当日运动时长（分钟）
    goal_achieved = db.Column(db.Boolean, default=False)  # 是否达成目标
    shared_to_twitter = db.Column(db.Boolean, default=False)  # 是否分享到推特
    
    # 创建唯一约束
    __table_args__ = (db.UniqueConstraint('user_id', 'stat_date', name='unique_user_date'),)
    
    def __repr__(self):
        return f'<DailyStats {self.user_id} - {self.stat_date}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'stat_date': self.stat_date.isoformat() if self.stat_date else None,
            'daily_count': self.daily_count,
            'daily_time_minutes': self.daily_time_minutes,
            'goal_achieved': self.goal_achieved,
            'shared_to_twitter': self.shared_to_twitter
        }

class CommunityPost(db.Model):
    """社区动态模型"""
    __tablename__ = 'community_posts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('tigang_users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    post_type = db.Column(db.String(20), default='achievement')  # achievement, milestone, general
    exercise_count = db.Column(db.Integer, default=0)  # 相关的运动次数
    streak_days = db.Column(db.Integer, default=0)  # 连续天数
    likes_count = db.Column(db.Integer, default=0)
    retweets_count = db.Column(db.Integer, default=0)
    twitter_post_id = db.Column(db.String(50), nullable=True)  # 推特帖子ID
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关联用户
    user = db.relationship('TigangUser', backref='posts')
    
    def __repr__(self):
        return f'<CommunityPost {self.id} by {self.user_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else None,
            'avatar_emoji': self.user.avatar_emoji if self.user else '💪',
            'is_verified': self.user.is_verified if self.user else False,
            'content': self.content,
            'post_type': self.post_type,
            'exercise_count': self.exercise_count,
            'streak_days': self.streak_days,
            'likes_count': self.likes_count,
            'retweets_count': self.retweets_count,
            'twitter_post_id': self.twitter_post_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'timestamp': self.get_relative_time()
        }
    
    def get_relative_time(self):
        """获取相对时间显示"""
        if not self.created_at:
            return '未知时间'
        
        now = datetime.utcnow()
        diff = now - self.created_at
        
        if diff.days > 0:
            return f'{diff.days}天前'
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f'{hours}小时前'
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f'{minutes}分钟前'
        else:
            return '刚刚'

class Leaderboard(db.Model):
    """排行榜模型"""
    __tablename__ = 'leaderboard'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('tigang_users.id'), nullable=False)
    period_type = db.Column(db.String(20), nullable=False)  # daily, weekly, monthly
    period_date = db.Column(db.Date, default=date.today)
    rank_position = db.Column(db.Integer, nullable=False)
    score = db.Column(db.Integer, nullable=False)  # 排名分数
    badge_emoji = db.Column(db.String(10), default='⭐')
    
    # 关联用户
    user = db.relationship('TigangUser', backref='rankings')
    
    # 创建唯一约束
    __table_args__ = (db.UniqueConstraint('user_id', 'period_type', 'period_date', name='unique_user_period'),)
    
    def __repr__(self):
        return f'<Leaderboard {self.user_id} - {self.period_type} - Rank {self.rank_position}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else None,
            'avatar_emoji': self.user.avatar_emoji if self.user else '💪',
            'period_type': self.period_type,
            'period_date': self.period_date.isoformat() if self.period_date else None,
            'rank_position': self.rank_position,
            'score': self.score,
            'badge_emoji': self.badge_emoji
        }


