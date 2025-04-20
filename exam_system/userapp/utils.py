from userapp.models.user import User

def get_user_from_session(request):
    try:
        user_data = request.session.get('user')
        if user_data:
            user = User.find_by_email(user_data.get('email'))
            if user:
                user.picture = user_data.get('picture')
                user.expiry_at = user.get_expiry_at()
                return user
        return None
    except Exception as e:
        raise e
