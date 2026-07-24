import { findUserByEmail, findRoleInviteByEmail, createRoleInvite } from "./user.repository.js";
import emailQueue from "../../infrastructure/queues/email.queue.js";
import type { CreateInviteProps, CreateInviteResult } from "./user.types.js";

const createInvite = async ({ email, role, invitedById, invitedByName }: CreateInviteProps): Promise<CreateInviteResult> => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return { type: "EMAIL_ALREADY_REGISTERED" };
  }

  const existingInvite = await findRoleInviteByEmail(email);
  if (existingInvite) {
    return { type: "INVITE_ALREADY_EXISTS" };
  }

  await createRoleInvite(email, role, invitedById);

  await emailQueue.add("sendRoleInviteEmail", {
    email,
    role,
    invitedByName,
    signupLink: `${process.env.BASE_URL}/signup`,
  });

  return { type: "SUCCESS" };
};

export { createInvite };