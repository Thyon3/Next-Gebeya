import User from "@/models/User";
import db from "@/utils/db";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcryptjs from "bcryptjs";

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On initial sign in, add user data to token
      if (user) {
        token._id = user._id;
        token.isAdmin = user.isAdmin;
        token.profileImage = user.profileImage;
        console.log('=== JWT CALLBACK (Initial Login) ===');
        console.log('Setting token with user data:', {
          _id: user._id,
          isAdmin: user.isAdmin,
          email: user.email,
          profileImage: user.profileImage
        });
      }
      
      // Handle session updates (e.g., profile updates)
      if (trigger === "update" && session) {
        token.name = session.user.name;
        token.email = session.user.email;
        token.profileImage = session.user.profileImage;
      }
      
      console.log('=== JWT CALLBACK (Current Token) ===');
      console.log('Token _id:', token._id);
      console.log('Token isAdmin:', token.isAdmin);
      
      return token;
    },
    async session({ session, token }) {
      session.user._id = token._id;
      session.user.isAdmin = token.isAdmin;
      session.user.profileImage = token.profileImage;
      
      console.log('=== SESSION CALLBACK ===');
      console.log('Session user:', {
        email: session.user.email,
        _id: session.user._id,
        isAdmin: session.user.isAdmin,
        profileImage: session.user.profileImage
      });
      
      return session;
    },
    async signIn({ user, account, profile }) {
      // For OAuth providers (Google, GitHub)
      if (account.provider === "google" || account.provider === "github") {
        await db.connect();
        
        // Check if user exists
        let dbUser = await User.findOne({ email: user.email });
        
        if (!dbUser) {
          // Create new user for OAuth
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            password: bcryptjs.hashSync(Math.random().toString(36), 12), // Random password for OAuth users
            isAdmin: false,
            profileImage: user.image || null,
          });
          console.log('Created new OAuth user:', dbUser.email);
        }
        
        // Set user._id and isAdmin for JWT callback
        user._id = dbUser._id.toString();
        user.isAdmin = dbUser.isAdmin;
        user.profileImage = dbUser.profileImage || user.image;
      }
      
      return true;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await db.connect();
        
        const user = await User.findOne({
          email: credentials.email,
        });
        
        console.log('=== LOGIN ATTEMPT ===');
        console.log('Email:', credentials.email);
        console.log('User found:', !!user);
        
        if (user) {
          console.log('User details from DB:');
          console.log('  - ID:', user._id.toString());
          console.log('  - Name:', user.name);
          console.log('  - Email:', user.email);
          console.log('  - isAdmin:', user.isAdmin);
          console.log('  - isAdmin type:', typeof user.isAdmin);
        }
        
        if (user && bcryptjs.compareSync(credentials.password, user.password)) {
          // Check if email is verified
          if (!user.isEmailVerified) {
            console.log('✗ Login failed: Email not verified');
            throw new Error("Please verify your email before logging in");
          }

          const userData = {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: "default",
            isAdmin: user.isAdmin,
            profileImage: user.profileImage,
          };
          console.log('✓ Login successful!');
          console.log('Returning user data:', JSON.stringify(userData, null, 2));
          return userData;
        }
        
        console.log('✗ Login failed: Invalid credentials');
        throw new Error("Invalid email or password");
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
