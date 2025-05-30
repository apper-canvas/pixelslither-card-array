import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <motion.div 
        className="text-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="mb-8"
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <ApperIcon name="Skull" className="w-24 h-24 mx-auto text-neon-pink mb-4" />
        </motion.div>
        
        <h1 className="text-6xl font-game font-black text-neon-green mb-4 neon-text">
          404
        </h1>
        
        <h2 className="text-2xl font-game text-neon-pink mb-6">
          Game Over!
        </h2>
        
        <p className="text-gray-300 mb-8 leading-relaxed">
          Looks like you've slithered into uncharted territory. 
          The page you're looking for doesn't exist in this digital realm.
        </p>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 game-button neon-button-green"
          >
            <ApperIcon name="Home" className="w-5 h-5" />
            <span>Return to Game</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default NotFound