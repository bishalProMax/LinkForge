import passport from "passport";
import { Strategy as GoogleStrategy, type Profile, type VerifyCallback } from "passport-google-oauth20";
import User from "../../models/user.model.js";
import { findRoleInviteByEmail, deleteRoleInviteByEmail } from "../../modules/admin/admin.repository.js";
import emailQueue from "../queues/email.queue.js";
import { logSecurityEvent } from "../../shared/services/securityLogger.service.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },

    async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const email = profile.emails?.[0].value;

        if (!email) {
          return done(new Error("No email found"));
        }

        // Find existing Google account
        let user = await User.findOne({
          googleId: profile.id,
        });

        // If Google account not found,
        // check by email
        if (!user) {
          user = await User.findOne({
            email,
          });

          // Completely new user
          if (!user) {
            const pendingInvite = await findRoleInviteByEmail(email);
            const assignedRole = pendingInvite ? pendingInvite.role : "USER";
            user = await User.create({
              name: profile.displayName,
              email,
              isVerified: true,
              authProviders: ["google"],
              googleId: profile.id,
              role: assignedRole,
            });
            
            if (pendingInvite) {
              await deleteRoleInviteByEmail(email);
              logSecurityEvent({ event: "INVITE_ACCEPTED", email, userId: user._id.toString(), role: assignedRole }, "info");
            } else {
              logSecurityEvent({ event: "GOOGLE_ACCOUNT_CREATED", email, userId: user._id.toString(), role: user.role }, "info");
            }

            await emailQueue.add("sendWelcomeEmail", {
              email: user.email,
              name: user.name,
              loginLink: `${process.env.BASE_URL}/login`,
            });
          } else {
            // Existing local account
            // Link Google provider
            user.googleId = profile.id;

            if (!user.authProviders.includes("google")) {
              user.authProviders.push("google");
            }

            await user.save();
            logSecurityEvent({ event: "GOOGLE_ACCOUNT_LINKED", email, userId: user._id.toString(), role: user.role }, "info");
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

export default passport;
