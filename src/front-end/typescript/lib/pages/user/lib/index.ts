import { DEFAULT_USER_AVATAR_IMAGE_PATH } from 'front-end/config';
import { fileBlobPath } from 'front-end/lib';
import { ThemeColor } from 'front-end/lib/types';
import { KeyCloakIdentityProvider, User, UserStatus, UserType} from 'shared/lib/resources/user';
import { GOV_IDPS, VENDOR_IDPS } from 'shared/config';

export function userAvatarPath(user?: Pick<User, 'avatarImageFile'>): string {
  return user && user.avatarImageFile
    ? fileBlobPath(user.avatarImageFile)
    : DEFAULT_USER_AVATAR_IMAGE_PATH;
}

export function keyCloakIdentityProviderToTitleCase(v: KeyCloakIdentityProvider): string | null {
  let idp;
  
  if (VENDOR_IDPS.has(v))
    idp = VENDOR_IDPS.get(v);
  else if (GOV_IDPS.has(v))
    idp = GOV_IDPS.get(v);
  
  if (idp)
    return idp.name;
  
  return null;
}

export function userToKeyCloakIdentityProviderTitleCase(user: User): string | null {
  //TODO Now that we can have more that one idp per user type we need to figure out a "title" that has a meaning
  return 'Service chosen to log in';
}

export function userTypeToTitleCase(v: UserType): string {
  switch (v) {
      case UserType.Government:
      case UserType.Admin:
        return 'Public Sector Employee';
      case UserType.Vendor:
        return 'Vendor';
  }
}

export function userTypeToPermissions(v: UserType): string[] {
  switch (v) {
      case UserType.Admin:
        return ['Admin'];
      case UserType.Government:
      case UserType.Vendor:
        return [];
  }
}

export function userStatusToTitleCase(v: UserStatus): string {
  switch (v) {
      case UserStatus.InactiveByAdmin:
      case UserStatus.InactiveByUser:
        return 'Inactive';
      case UserStatus.Active:
        return 'Active';
  }
}

export function userStatusToColor(v: UserStatus): ThemeColor {
  switch (v) {
      case UserStatus.InactiveByAdmin:
      case UserStatus.InactiveByUser:
        return 'danger';
      case UserStatus.Active:
        return 'success';
  }
}
