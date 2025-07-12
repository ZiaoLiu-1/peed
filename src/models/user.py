from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    nickname = db.Column(db.String(100), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    avatar_url = db.Column(db.Text, nullable=True)  # 支持base64或URL
    wallet_address = db.Column(db.String(200), nullable=True)
    wallet_type = db.Column(db.String(50), nullable=True)  # phantom, solflare, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # 关系
    training_records = db.relationship('TrainingRecord', backref='user', lazy=True, cascade='all, delete-orphan')
    user_achievements = db.relationship('UserAchievement', backref='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self, include_wallet=False):
        result = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'nickname': self.nickname,
            'bio': self.bio,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
        
        if include_wallet:
            result.update({
                'wallet_address': self.wallet_address,
                'wallet_type': self.wallet_type
            })
        
        return result

class TrainingRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    difficulty = db.Column(db.String(20), nullable=False)  # beginner, intermediate, advanced
    sets_completed = db.Column(db.Integer, nullable=False)
    reps_completed = db.Column(db.Integer, nullable=False)
    total_duration = db.Column(db.Integer, nullable=False)  # 秒
    session_date = db.Column(db.Date, default=datetime.utcnow().date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 训练配置
    contract_time = db.Column(db.Integer, nullable=False)  # 收缩时间（秒）
    relax_time = db.Column(db.Integer, nullable=False)  # 放松时间（秒）

    def __repr__(self):
        return f'<TrainingRecord {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'difficulty': self.difficulty,
            'sets_completed': self.sets_completed,
            'reps_completed': self.reps_completed,
            'total_duration': self.total_duration,
            'session_date': self.session_date.isoformat() if self.session_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'contract_time': self.contract_time,
            'relax_time': self.relax_time
        }

class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    name_en = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    description_en = db.Column(db.Text, nullable=False)
    icon = db.Column(db.String(50), nullable=False)  # lucide icon name
    category = db.Column(db.String(50), nullable=False)  # streak, count, time, etc.
    target_value = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系
    user_achievements = db.relationship('UserAchievement', backref='achievement', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'name_en': self.name_en,
            'description': self.description,
            'description_en': self.description_en,
            'icon': self.icon,
            'category': self.category,
            'target_value': self.target_value,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class UserAchievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievement.id'), nullable=False)
    progress = db.Column(db.Integer, default=0)
    unlocked = db.Column(db.Boolean, default=False)
    unlocked_at = db.Column(db.DateTime, nullable=True)
    
    # 复合唯一约束
    __table_args__ = (db.UniqueConstraint('user_id', 'achievement_id'),)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'achievement_id': self.achievement_id,
            'progress': self.progress,
            'unlocked': self.unlocked,
            'unlocked_at': self.unlocked_at.isoformat() if self.unlocked_at else None,
            'achievement': self.achievement.to_dict() if self.achievement else None
        }


