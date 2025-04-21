from historyapp.models.history_exam import HistoryExam
from userapp.models.user import User

def get_ongoing_exam(request):
    try:
        user_data = request.session.get('user')
        if user_data:
            user = User.find_by_email(user_data.get('email'))
            if user:
                history_exam = HistoryExam.find_ongoing_exam(user)
                if history_exam:
                    history_exam.history_answers = history_exam.get_history_answers()
                    return history_exam
        return None
    except Exception as e:
        raise e