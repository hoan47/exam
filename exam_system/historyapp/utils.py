from historyapp.models.history_exam import HistoryExam
from userapp.models.user import User

def get_ongoing_exam(request):
    try:
        user_data = request.session.get('user')
        if user_data:
            user = User.find_by_email(user_data.get('email'))
            if user:
                return HistoryExam.find_ongoing_exam(user)
        return None
    except Exception as e:
        raise e
    
def get_history_exams(request):
    try:
        user_data = request.session.get('user')
        if user_data is None:
            return None
        user = User.find_by_email(user_data.get('email'))
        if user is None:
            return None
        return HistoryExam.find_latest_history_per_exam(user)
    except Exception as e:
        raise e