class Config:
    SECRET_KEY = 'your-secret-key-here'  # Change this in production
    SQLALCHEMY_DATABASE_URI = 'sqlite:///quotes.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
