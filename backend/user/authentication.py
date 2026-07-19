from rest_framework_simplejwt.authentication import JWTAuthentication
class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self , req):
        raw_token = req.COOKIES.get("access_token")
        if raw_token is None:
            return None
        validated_token = self.get_validated_token(
            raw_token.encode()
        )

        return(
            self.get_user(validated_token),
            validated_token
        )
