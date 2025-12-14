// src/components/landing/LandingPage.jsx
import {
  Heart,
  Search,
  Calendar,
  Star,
  Shield,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LandingPage = () => {
  const navigate = useNavigate();

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Heart className="w-8 h-8 text-purple-600" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Nursify
            </span>
          </motion.div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(139, 92, 246, 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="px-6 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 40px rgba(139, 92, 246, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition"
            >
              Sign Up
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 relative">
        {/* Floating Background Elements */}
        <motion.div
          animate={floatingAnimation}
          className="absolute top-20 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute bottom-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
        />

        <div className="text-center mb-16 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={scaleIn} className="inline-block mb-4">
              <span className="px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                #1 Healthcare Platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Find Your Perfect{" "}
              <motion.span
                className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent inline-block"
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                Nurse
              </motion.span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              Connect with qualified healthcare professionals for personalized
              home care services. Book appointments easily and get the care you
              deserve.
            </motion.p>

            <motion.button
              variants={fadeInUp}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 60px rgba(139, 92, 246, 0.4)",
                y: -5,
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="group px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-lg font-semibold shadow-2xl transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                Get Started Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
            </motion.button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8 mt-20"
        >
          {[
            {
              icon: Search,
              title: "Search & Book",
              description:
                "Find qualified nurses by specialty, location, and availability. Book appointments that work for your schedule.",
              color: "purple",
              delay: 0,
            },
            {
              icon: Shield,
              title: "Licensed Professionals",
              description:
                "All nurses are licensed, verified, and experienced healthcare professionals you can trust.",
              color: "blue",
              delay: 0.2,
            },
            {
              icon: Heart,
              title: "Quality Care",
              description:
                "Receive personalized, compassionate care in the comfort of your own home.",
              color: "green",
              delay: 0.4,
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{
                y: -10,
                scale: 1.03,
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
              }}
              className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <motion.div
                className={`w-16 h-16 bg-${feature.color}-100 rounded-full flex items-center justify-center mb-6`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <feature.icon className={`w-8 h-8 text-${feature.color}-600`} />
              </motion.div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-purple-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="mt-20 bg-white rounded-2xl shadow-2xl p-12"
        >
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Qualified Nurses", color: "purple" },
              { number: "10k+", label: "Happy Patients", color: "blue" },
              { number: "4.8", label: "Average Rating", color: "green" },
              { number: "24/7", label: "Support Available", color: "orange" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ scale: 1.1, y: -5 }}
                className="cursor-pointer"
              >
                <motion.div
                  className={`text-5xl font-bold text-${stat.color}-600 mb-2`}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    delay: index * 0.1,
                  }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="mt-20 text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-5xl font-bold mb-12 text-gray-900"
          >
            How It Works
          </motion.h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: "Sign Up",
                desc: "Create your account in minutes",
                icon: Users,
              },
              {
                step: 2,
                title: "Find a Nurse",
                desc: "Search by specialty and location",
                icon: Search,
              },
              {
                step: 3,
                title: "Book Appointment",
                desc: "Choose your preferred date and time",
                icon: Calendar,
              },
              {
                step: 4,
                title: "Get Care",
                desc: "Receive quality healthcare at home",
                icon: Heart,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -15, scale: 1.05 }}
                className="relative text-center group"
              >
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold shadow-2xl"
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                >
                  {item.step}
                </motion.div>
                <motion.div
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <item.icon className="w-8 h-8 text-purple-600" />
                </motion.div>
                <h3 className="font-bold mb-2 text-lg">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-center text-white relative overflow-hidden"
        >
          {/* Animated background */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-10"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white to-transparent" />
          </motion.div>

          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-bold mb-4"
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-xl mb-8 opacity-90"
            >
              Join thousands of patients receiving quality care
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                y: -5,
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="group px-10 py-4 bg-white text-purple-600 rounded-xl text-lg font-semibold shadow-2xl"
            >
              <span className="flex items-center gap-2">
                Create Account Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900 text-white mt-20 py-12"
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            className="flex items-center justify-center gap-2 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Heart className="w-6 h-6" />
            <span className="text-xl font-bold">Nursify</span>
          </motion.div>
          <p className="text-gray-400">© 2024 Nursify. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
