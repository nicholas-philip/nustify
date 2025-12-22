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
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
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
        className="bg-white/80 backdrop-blur-sm shadow-sm fixed top-0 left-0 w-full z-50"
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="px-6 py-2 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
            >
              Login
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 30px rgba(147, 51, 234, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium shadow-lg"
            >
              Sign Up
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.div className="relative py-28 overflow-hidden mt-16">
        {/* Animated Background Image */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 10,
            ease: "easeOut",
          }}
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/7659565/pexels-photo-7659565.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

        {/* Floating Blobs */}
        <motion.div
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-24 right-24 w-72 h-72 bg-purple-500 rounded-full blur-3xl opacity-30"
        />

        <motion.div
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-24 left-24 w-72 h-72 bg-blue-400 rounded-full blur-3xl opacity-30"
        />

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={scaleIn} className="inline-block mb-4">
              <span className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-full text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                #1 Healthcare Platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-6xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Find Your Perfect{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Doctors
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
            >
              Connect with qualified healthcare professionals for personalized
              home care services.
            </motion.p>

            <motion.button
              variants={fadeInUp}
              whileHover={{
                scale: 1.08,
                y: -4,
                boxShadow: "0 25px 50px rgba(147, 51, 234, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="group px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-lg font-semibold shadow-2xl"
            >
              <span className="flex items-center gap-2">
                Get Started Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4">
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
              gradient: "from-purple-500 to-purple-600",
              bgColor: "bg-purple-50",
              iconColor: "text-purple-600",
              image:
                "https://images.pexels.com/photos/7089020/pexels-photo-7089020.jpeg",
            },
            {
              icon: Shield,
              title: "Licensed Professionals",
              description:
                "All nurses are licensed, verified, and experienced healthcare professionals you can trust.",
              gradient: "from-blue-500 to-blue-600",
              bgColor: "bg-blue-50",
              iconColor: "text-blue-600",
              image:
                "https://images.pexels.com/photos/7195310/pexels-photo-7195310.jpeg",
            },
            {
              icon: Heart,
              title: "Quality Care",
              description:
                "Receive personalized, compassionate care in the comfort of your own home.",
              gradient: "from-green-500 to-green-600",
              bgColor: "bg-green-50",
              iconColor: "text-green-600",
              image:
                "https://images.pexels.com/photos/7551662/pexels-photo-7551662.jpeg",
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
              className="bg-white rounded-2xl shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden">
                <motion.img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <motion.div
                  className={`absolute bottom-4 left-4 w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center shadow-xl`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                </motion.div>
              </div>

              {/* Content Section */}
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-purple-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="mt-20 relative rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://images.pexels.com/photos/7089400/pexels-photo-7089400.jpeg"
              alt="Healthcare team"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/95 to-blue-900/95" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                {
                  number: "500+",
                  label: "Qualified Nurses",
                  icon: Users,
                  gradient: "from-purple-400 to-purple-300",
                },
                {
                  number: "10k+",
                  label: "Happy Patients",
                  icon: Heart,
                  gradient: "from-blue-400 to-blue-300",
                },
                {
                  number: "4.8",
                  label: "Average Rating",
                  icon: Star,
                  gradient: "from-green-400 to-green-300",
                },
                {
                  number: "24/7",
                  label: "Support Available",
                  icon: Clock,
                  gradient: "from-orange-400 to-orange-300",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="cursor-pointer group"
                >
                  <motion.div
                    className="relative mb-4"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      delay: index * 0.1,
                    }}
                  >
                    <div
                      className={`text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                    >
                      {stat.number}
                    </div>
                    <motion.div
                      className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </motion.div>
                  </motion.div>
                  <div className="text-white font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
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
            className="text-5xl font-bold mb-4 text-gray-900"
          >
            How It Works
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto"
          >
            Get started in four simple steps
          </motion.p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: "Sign Up",
                desc: "Create your account in minutes",
                icon: Users,
                gradient: "from-purple-500 to-purple-600",
                image:
                  "https://images.pexels.com/photos/5867731/pexels-photo-5867731.jpeg",
              },
              {
                step: 2,
                title: "Find a Doctor",
                desc: "Search by specialty and location",
                icon: Search,
                gradient: "from-blue-500 to-blue-600",
                image:
                  "https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg",
              },
              {
                step: 3,
                title: "Book Appointment",
                desc: "Choose your preferred date and time",
                icon: Calendar,
                gradient: "from-green-500 to-green-600",
                image:
                  "https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg",
              },
              {
                step: 4,
                title: "Get Care",
                desc: "Receive quality healthcare at home",
                icon: Heart,
                gradient: "from-pink-500 to-pink-600",
                image:
                  "https://images.pexels.com/photos/7345465/pexels-photo-7345465.jpeg",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -15, scale: 1.05 }}
                className="relative text-center group"
              >
                {/* Image Background */}
                <div className="relative mb-4 rounded-2xl overflow-hidden h-40">
                  <motion.img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Step Number */}
                  <motion.div
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${item.gradient} text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-2xl`}
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                  >
                    {item.step}
                    <motion.div
                      className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                </div>

                <motion.div
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-2 shadow-lg z-10"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <item.icon className="w-6 h-6 text-purple-600" />
                </motion.div>
                <h3 className="font-bold mb-2 text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                  {item.title}
                </h3>
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
          className="mt-20 mb-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-center text-white relative overflow-hidden"
        >
          {/* Animated background patterns */}
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

          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"
          />

          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 7, repeat: Infinity }}
            className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"
          />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-12 h-12 mx-auto" />
            </motion.div>
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
        className="bg-gray-900 text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div>
              <motion.div
                className="flex items-center gap-2 mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-8 h-8 text-purple-400" />
                </motion.div>
                <span className="text-2xl font-bold">Nursify</span>
              </motion.div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your trusted platform for connecting with qualified healthcare
                professionals. Quality care, anytime, anywhere.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3">
                {["About Us", "How It Works", "Find a Nurse", "Pricing"].map(
                  (link, i) => (
                    <motion.li
                      key={i}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <a
                        href="#"
                        className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                      >
                        {link}
                      </a>
                    </motion.li>
                  )
                )}
              </ul>
            </div>

            {/* For Nurses */}
            <div>
              <h3 className="font-bold text-lg mb-4">For Nurses</h3>
              <ul className="space-y-3">
                {[
                  "Register as Nurse",
                  "Nurse Dashboard",
                  "Resources",
                  "Support",
                ].map((link, i) => (
                  <motion.li
                    key={i}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <a
                      href="#"
                      className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <Mail className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>support@nursify.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>
                    123 Healthcare Ave,
                    <br />
                    Medical District, CA 90210
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2024 Nursify. All rights reserved.
              </p>

              {/* Social Links */}
              <div className="flex gap-4">
                {[
                  { name: "Facebook", icon: Facebook },
                  { name: "Twitter", icon: Twitter },
                  { name: "Instagram", icon: Instagram },
                  { name: "LinkedIn", icon: Linkedin },
                ].map((social, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
                    title={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>

              {/* Legal Links */}
              <div className="flex gap-6 text-sm">
                {["Privacy Policy", "Terms of Service"].map((link, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ color: "#a78bfa" }}
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    {link}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
