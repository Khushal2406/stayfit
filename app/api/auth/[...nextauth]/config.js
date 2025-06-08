import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
const { connectDB } = require('@/lib/db');
const User = require('@/models/User');

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password');
        }

        await connectDB();
        
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error('No user found with this email');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }        // Include user details in the returned object
        return {
          id: user._id,
          email: user.email,
          name: user.name,
          age: user.age,
          gender: user.gender,
          weight: user.weight,
          height: user.height,
          dailyCalorieTarget: user.dailyCalorieTarget
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Add all user details to the token
        token.id = user.id;
        token.age = user.age;
        token.gender = user.gender;
        token.weight = user.weight;
        token.height = user.height;
        token.dailyCalorieTarget = user.dailyCalorieTarget;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // Add all user details to the session
        session.user.id = token.id;
        session.user.age = token.age;
        session.user.gender = token.gender;
        session.user.weight = token.weight;
        session.user.height = token.height;
        session.user.dailyCalorieTarget = token.dailyCalorieTarget;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      return url.startsWith(baseUrl) ? url : baseUrl
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
