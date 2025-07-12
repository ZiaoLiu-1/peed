import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from src.models.user import db, User, TrainingRecord, Achievement, UserAchievement
from src.routes.user import user_bp
from src.routes.tigang import tigang_bp
from datetime import datetime, date, timedelta
from sqlalchemy import text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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
            existing = Achievement.query.filter_by(name=achievement_data['name']).first()
            if not existing:
                achievement = Achievement(**achievement_data)
                db.session.add(achievement)
        
        db.session.commit()
        print("✅ Achievements initialized successfully")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Failed to initialize achievements: {e}")

def init_sample_users():
    """初始化示例用户"""
    if not User.query.first():
        sample_users = [
            {
                'username': 'demo_user',
                'nickname': 'PEED演示用户',
                'bio': '欢迎使用PEED健康训练系统！',
                'email': 'demo@peed.com'
            },
            {
                'username': 'trainer_pro',
                'nickname': '专业训练师',
                'bio': '健康生活从提肛训练开始',
                'email': 'trainer@peed.com'
            }
        ]
        
        try:
            for user_data in sample_users:
                user = User(**user_data)
                db.session.add(user)
                db.session.flush()  # 获取用户ID
                
                # 为用户初始化成就
                achievements = Achievement.query.all()
                for achievement in achievements:
                    user_achievement = UserAchievement(
                        user_id=user.id,
                        achievement_id=achievement.id,
                        progress=0,
                        unlocked=False
                    )
                    db.session.add(user_achievement)
                
                # 为演示用户添加一些示例训练记录
                if user.username == 'demo_user':
                    sample_training = [
                        {
                            'difficulty': 'beginner',
                            'sets_completed': 2,
                            'reps_completed': 16,
                            'total_duration': 160,  # 约2.7分钟
                            'contract_time': 5,
                            'relax_time': 5,
                            'session_date': date.today() - timedelta(days=2)
                        },
                        {
                            'difficulty': 'intermediate',
                            'sets_completed': 3,
                            'reps_completed': 36,
                            'total_duration': 576,  # 约9.6分钟
                            'contract_time': 8,
                            'relax_time': 8,
                            'session_date': date.today() - timedelta(days=1)
                        },
                        {
                            'difficulty': 'beginner',
                            'sets_completed': 2,
                            'reps_completed': 16,
                            'total_duration': 160,
                            'contract_time': 5,
                            'relax_time': 5,
                            'session_date': date.today()
                        }
                    ]
                    
                    for training_data in sample_training:
                        training_record = TrainingRecord(
                            user_id=user.id,
                            **training_data
                        )
                        db.session.add(training_record)
            
            db.session.commit()
            print("✅ Sample users initialized successfully")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Failed to initialize sample users: {e}")

def get_database_config():
    """Get database configuration, fallback to SQLite if PostgreSQL not available"""
    use_postgres = os.getenv('USE_POSTGRES', 'false').lower() == 'true'
    
    if use_postgres:
        # PostgreSQL configuration
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '5432')
        db_name = os.getenv('DB_NAME', 'peed_db')
        db_user = os.getenv('DB_USER', 'postgres')
        db_password = os.getenv('DB_PASSWORD', 'postgres')
        
        database_uri = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        engine_options = {
            'pool_pre_ping': True,
            'pool_recycle': 300,
            'pool_timeout': 20,
            'pool_size': 10,
            'max_overflow': 20
        }
        db_type = 'PostgreSQL'
    else:
        # SQLite configuration (fallback)
        database_dir = os.path.join(os.path.dirname(__file__), 'database')
        if not os.path.exists(database_dir):
            os.makedirs(database_dir)
        
        database_uri = f"sqlite:///{os.path.join(database_dir, 'peed.db')}"
        engine_options = {
            'pool_pre_ping': True,
            'pool_recycle': 300,
        }
        db_type = 'SQLite'
    
    return database_uri, engine_options, db_type

def create_app():
    app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'src', 'static'))
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'peed_secret_key_2024_postgresql')
    
    # Database Configuration
    database_uri, engine_options, db_type = get_database_config()
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = engine_options
    
    # Store database type for health check
    app.config['DB_TYPE'] = db_type
    
    # Initialize database
    db.init_app(app)
    
    # CORS Configuration
    cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001,http://localhost:3002').split(',')
    CORS(app, origins=cors_origins)
    
    # Register blueprints
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(tigang_bp, url_prefix='/api/tigang')
    
    return app

app = create_app()

# Create database tables and initialize data
with app.app_context():
    try:
        print(f"🔧 Creating database tables... (Using {app.config['DB_TYPE']})")
        db.create_all()
        print("✅ Database tables created successfully")
        
        # Initialize achievements
        try:
            init_achievements()
        except NameError:
            print("⚠️  Achievement initialization skipped (function not found)")
        
        # Create sample users (if not exists)
        try:
            init_sample_users()
        except NameError:
            print("⚠️  Sample user initialization skipped (function not found)")
        
        print("✅ Database initialization completed")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        if app.config['DB_TYPE'] == 'PostgreSQL':
            print("💡 PostgreSQL connection failed, consider:")
            print("   1. Run: docker-compose up -d postgres")
            print("   2. Or set USE_POSTGRES=false in .env to use SQLite")
        else:
            print("💡 Database setup failed, check file permissions")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

# 健康检查端点
@app.route('/health')
def health_check():
    try:
        # 检查数据库连接
        db.session.execute(text('SELECT 1')).fetchone()
        
        # 获取基本统计
        total_users = User.query.count()
        total_training_records = TrainingRecord.query.count()
        total_achievements = Achievement.query.count()
        
        return jsonify({
            'status': 'healthy',
            'service': 'PEED Backend',
            'version': '1.0.0',
            'database': f"{app.config['DB_TYPE']} - connected",
            'stats': {
                'total_users': total_users,
                'total_training_records': total_training_records,
                'total_achievements': total_achievements
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'PEED Backend',
            'database': f"{app.config.get('DB_TYPE', 'Unknown')} - connection failed",
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

# API信息端点
@app.route('/api/info')
def api_info():
    return jsonify({
        'service': 'PEED API',
        'version': '1.0.0',
        'description': 'PEED健康训练系统API',
        'database': app.config.get('DB_TYPE', 'Unknown'),
        'endpoints': {
            'auth': '/api/auth/*',
            'profile': '/api/profile/*',
            'wallet': '/api/wallet/*',
            'stats': '/api/stats/*',
            'training': '/api/tigang/training/*',
            'achievements': '/api/tigang/achievements/*',
            'leaderboard': '/api/tigang/training/leaderboard'
        },
        'documentation': 'https://github.com/your-repo/peed-api-docs'
    })

if __name__ == '__main__':
    print("🚀 Starting PEED Backend Server...")
    print(f"🗄️  Database: {app.config.get('DB_TYPE', 'Unknown')}")
    
    # Get port from environment variable (for Render deployment)
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') != 'production'
    
    print(f"🎯 Port: {port}")
    print(f"🌐 CORS: Enabled for {'production' if not debug else 'development'}")
    print("✨ Features: User Management, Training Records, Achievement System")
    
    db_type = app.config.get('DB_TYPE', 'Unknown')
    if db_type == 'PostgreSQL':
        print("💡 Using PostgreSQL - make sure it's running!")
        print("   Quick setup: docker-compose up -d postgres")
    else:
        print("💡 Using SQLite - ready to go!")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
