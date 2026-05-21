"""
utils/authentication.py

Custom JWTAuthentication that resolves the token's `user_id` claim
against apps.accounts.Vendor instead of Django's default User model.

Why needed:
  SimpleJWT's default JWTAuthentication calls
  `get_user_model()` to look up the user, which already works correctly
  when AUTH_USER_MODEL = "accounts.Vendor".  However, explicitly subclassing
  it lets us:
    1. Return clear 401 JSON in our { success, error } contract.
    2. Future-proof the class for extra claim checks (e.g. is_active guard).
    3. Register it explicitly so it's obvious which auth backend is active.
"""

from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken


class VendorJWTAuthentication(JWTAuthentication):
    """
    Drop-in replacement for JWTAuthentication that is explicitly tied
    to the Vendor model and adds an is_active guard.
    """

    def get_user(self, validated_token):
        """
        Override to enforce that the resolved Vendor account is still active.
        SimpleJWT's base implementation already uses AUTH_USER_MODEL, so we
        just add the is_active check on top.
        """
        vendor = super().get_user(validated_token)

        if not vendor.is_active:
            raise AuthenticationFailed(
                "This vendor account has been deactivated.",
                code="vendor_inactive",
            )

        return vendor
