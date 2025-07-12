#!/usr/bin/env python3
"""
Database setup script for PEED PostgreSQL database
"""
import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv
from src.models.user import User, Achievement, UserAchievement, db
from datetime import datetime

# Load environment variables
load_dotenv()

def create_database():
    """Create the PostgreSQL database if it doesn't exist"""
    
    # Database connection parameters
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'peed_db')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', 'postgres')
    
    print(f"🔧 Setting up PostgreSQL database '{db_name}'...")
    print(f"📍 Host: {db_host}:{db_port}")
    print(f"👤 User: {db_user}")
    
    try:
        # Connect to PostgreSQL server (not to specific database)
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            database='postgres'  # Connect to default postgres database
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
        exists = cursor.fetchone()
        
        if not exists:
            print(f"🏗️  Creating database '{db_name}'...")
            cursor.execute(f'CREATE DATABASE "{db_name}"')
            print(f"✅ Database '{db_name}' created successfully!")
        else:
            print(f"✅ Database '{db_name}' already exists!")
        
        cursor.close()
        conn.close()
        
        # Test connection to the new database
        print(f"🧪 Testing connection to '{db_name}'...")
        test_conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            database=db_name
        )
        test_conn.close()
        print("✅ Database connection test successful!")
        
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Database setup failed: {e}")
        print("\n💡 Troubleshooting tips:")
        print("   1. Make sure PostgreSQL is running")
        print("   2. Check your connection parameters in .env file")
        print("   3. Ensure the PostgreSQL user has CREATE DATABASE privileges")
        print("   4. Try connecting manually: psql -h localhost -U postgres")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def setup_database():
    """设置数据库和初始数据"""
    # 创建所有表
    db.create_all()
    
    # 清理现有用户的默认bio
    cleanup_default_bio()
    
    # 初始化成就数据
    init_achievements()
    
    print("Database setup completed!")

def cleanup_default_bio():
    """清理现有用户的默认bio"""
    try:
        # 查找所有具有默认bio的用户
        users_with_default_bio = User.query.filter(
            User.bio.in_(['热爱健康生活的小乌龟训练师', '通过钱包连接的PEED用户'])
        ).all()
        
        for user in users_with_default_bio:
            user.bio = ''  # 清空bio
            print(f"Cleaned bio for user: {user.username}")
        
        db.session.commit()
        print(f"Cleaned bio for {len(users_with_default_bio)} users")
    except Exception as e:
        db.session.rollback()
        print(f"Error cleaning up bio: {e}")

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
        print("Achievements initialized successfully")
    except Exception as e:
        db.session.rollback()
        print(f"Error initializing achievements: {e}")

def main():
    """Main function"""
    print("Setting up database...")
    
    if create_database():
        print("Database created successfully!")
        # Now setup the database with tables and initial data
        setup_database()
    else:
        print("Failed to create database!")
        return False
    
    return True

if __name__ == "__main__":
    sys.exit(main()) 