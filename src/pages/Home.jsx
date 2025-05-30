import React from 'react'
import { motion } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'

const Home = ({ darkMode, toggleDarkMode }) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 grid-pattern opacity-30"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              i % 4 === 0 ? 'bg-neon-green' : 
              i % 4 === 1 ? 'bg-neon-pink' : 
              i % 4 === 2 ? 'bg-neon-blue' : 'bg-neon-yellow'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header 
        className="relative z-10 px-4 py-6 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-neon-green to-neon-blue rounded-lg flex items-center justify-center shadow-neon-green">
              <ApperIcon name="Zap" className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-transparent bg-gradient-to-r from-neon-green via-neon-blue to-neon-pink bg-clip-text animate-glow">
              PixelSlither
            </h1>
          </motion.div>
          
          <motion.button
            onClick={toggleDarkMode}
            className="p-3 rounded-lg bg-black bg-opacity-30 border border-neon-green hover:bg-opacity-50 transition-all duration-300 group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ApperIcon 
              name={darkMode ? "Sun" : "Moon"} 
              className="w-5 h-5 text-neon-green group-hover:text-neon-yellow transition-colors" 
            />
          </motion.button>
        </div>
      </motion.header>

      {/* Main Game Area */}
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-game text-neon-green mb-4 neon-text">
              Classic Snake Game Experience
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Navigate your growing serpent through the digital realm. Collect glowing orbs to increase your score, 
              but beware - one wrong move and it's game over!
            </p>
          </motion.div>

          <MainFeature />
        </div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="relative z-10 px-4 py-6 sm:px-6 lg:px-8 mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-400 text-sm">
            <div className="flex items-center space-x-2">
              <ApperIcon name="Gamepad2" className="w-4 h-4 text-neon-green" />
              <span>Use WASD or Arrow Keys</span>
            </div>
            <div className="flex items-center space-x-2">
              <ApperIcon name="Target" className="w-4 h-4 text-neon-pink" />
              <span>Collect Pink Orbs</span>
            </div>
            <div className="flex items-center space-x-2">
              <ApperIcon name="Zap" className="w-4 h-4 text-neon-yellow" />
              <span>Avoid Yourself</span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

export default Home