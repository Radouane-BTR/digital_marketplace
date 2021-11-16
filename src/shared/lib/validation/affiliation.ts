import { MembershipType, parseMembershipType } from 'shared/lib/resources/affiliation';
import { invalid, valid, Validation } from 'shared/lib/validation';
import i18next from 'i18next';

export { validateEmail as validateUserEmail } from 'shared/lib/validation';

export function validateMembershipType(raw: string): Validation<MembershipType> {
  const membershipType = parseMembershipType(raw);
  return membershipType ? valid(membershipType) : invalid([i18next.t('invalidMembershipType')]);
}
