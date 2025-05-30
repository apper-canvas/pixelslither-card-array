import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'

const GRID_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION = { x: 0, y: 0 }
const INITIAL_FOOD = { x: 5, y: 5 }

const MainFeature = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [direction, setDirection] = useState(INITIAL_DIRECTION)
  const [food, setFood] = useState(INITIAL_FOOD)
  const [gameState, setGameState] = useState('waiting') // waiting, playing, paused, gameOver
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('pixelslither-highscore')
    return saved ? parseInt(saved) : 0
  })
  const [gameSpeed, setGameSpeed] = useState(200)
  const [boardSize, setBoardSize] = useState({ width: 30, height: 20 })

  const gameLoopRef = useRef()
  const canvasRef = useRef()

  // Responsive board sizing
  useEffect(() => {
    const updateBoardSize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setBoardSize({ width: 20, height: 15 })
      } else if (width < 768) {
        setBoardSize({ width: 25, height: 18 })
      } else {
        setBoardSize({ width: 30, height: 20 })
      }
    }

    updateBoardSize()
    window.addEventListener('resize', updateBoardSize)
    return () => window.removeEventListener('resize', updateBoardSize)
  }, [])

  // Generate random food position
  const generateFood = useCallback((currentSnake) => {
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * boardSize.width),
        y: Math.floor(Math.random() * boardSize.height)
      }
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [boardSize])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return

      const keyMap = {
        'ArrowUp': { x: 0, y: -1 },
        'ArrowDown': { x: 0, y: 1 },
        'ArrowLeft': { x: -1, y: 0 },
        'ArrowRight': { x: 1, y: 0 },
        'w': { x: 0, y: -1 },
        'W': { x: 0, y: -1 },
        's': { x: 0, y: 1 },
        'S': { x: 0, y: 1 },
        'a': { x: -1, y: 0 },
        'A': { x: -1, y: 0 },
        'd': { x: 1, y: 0 },
        'D': { x: 1, y: 0 }
      }

      const newDirection = keyMap[e.key]
      if (newDirection) {
        e.preventDefault()
        setDirection(prev => {
          // Prevent reversing into self
          if (prev.x === -newDirection.x && prev.y === -newDirection.y) {
            return prev
          }
          return newDirection
        })
      }

      if (e.key === ' ') {
        e.preventDefault()
        togglePause()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState])

// Game actions ref to handle state updates outside of render
  const gameActionsRef = useRef({
    shouldGameOver: false,
    shouldUpdateScore: false,
    newScore: 0,
    shouldLevelUp: false,
    newLevel: 0,
    shouldUpdateFood: false,
    newFood: null,
    shouldUpdateSpeed: false,
    newSpeed: 0
  })

  // Process game actions in separate effect to avoid setState during render
  useEffect(() => {
    const actions = gameActionsRef.current
    
    if (actions.shouldGameOver) {
      setGameState('gameOver')
      actions.shouldGameOver = false
    }
    
    if (actions.shouldUpdateScore) {
      setScore(actions.newScore)
      actions.shouldUpdateScore = false
      
      toast.success(`+${10 * level} points!`, {
        position: "top-right",
        autoClose: 1000,
      })
    }
    
    if (actions.shouldUpdateFood && actions.newFood) {
      setFood(actions.newFood)
      actions.shouldUpdateFood = false
      actions.newFood = null
    }
    
    if (actions.shouldLevelUp) {
      setLevel(actions.newLevel)
      actions.shouldLevelUp = false
      
      toast.success(`Level ${actions.newLevel}! Speed increased!`, {
        position: "top-center",
        autoClose: 2000,
      })
    }
    
    if (actions.shouldUpdateSpeed) {
      setGameSpeed(actions.newSpeed)
      actions.shouldUpdateSpeed = false
    }
  })

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    // Don't move if no direction is set (prevents false collisions on start)
    if (direction.x === 0 && direction.y === 0) return
    
    gameLoopRef.current = setInterval(() => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake]
        const head = { ...newSnake[0] }
        
        head.x += direction.x
        head.y += direction.y

        // Check wall collision
        if (head.x < 0 || head.x >= boardSize.width || head.y < 0 || head.y >= boardSize.height) {
          gameActionsRef.current.shouldGameOver = true
          return prevSnake
        }

        // Check self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          gameActionsRef.current.shouldGameOver = true
          return prevSnake
        }

        newSnake.unshift(head)

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          const newScore = score + (10 * level)
          gameActionsRef.current.shouldUpdateScore = true
          gameActionsRef.current.newScore = newScore
          gameActionsRef.current.shouldUpdateFood = true
          gameActionsRef.current.newFood = generateFood(newSnake)
          
          // Level up every 5 food items
          if (newScore > 0 && newScore % (50 * level) === 0) {
            gameActionsRef.current.shouldLevelUp = true
            gameActionsRef.current.newLevel = level + 1
            gameActionsRef.current.shouldUpdateSpeed = true
            gameActionsRef.current.newSpeed = Math.max(100, gameSpeed - 20)
          }
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }, gameSpeed)

    return () => clearInterval(gameLoopRef.current)
  }, [gameState, direction, food, score, level, gameSpeed, boardSize, generateFood])

  // Handle game over
  useEffect(() => {
    if (gameState === 'gameOver') {
      if (score > highScore) {
        setHighScore(score)
        localStorage.setItem('pixelslither-highscore', score.toString())
        toast.success('New High Score!', {
          position: "top-center",
          autoClose: 3000,
        })
      }
      toast.error('Game Over!', {
        position: "top-center",
        autoClose: 2000,
      })
    }
  }, [gameState, score, highScore])

  const startGame = () => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    setFood(generateFood(INITIAL_SNAKE))
    setScore(0)
    setLevel(1)
    setGameSpeed(200)
    setGameState('playing')
    toast.info('Game Started! Use WASD or Arrow Keys', {
      position: "top-center",
      autoClose: 2000,
    })
  }

  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused')
      toast.info('Game Paused', {
        position: "top-center",
        autoClose: 1000,
      })
    } else if (gameState === 'paused') {
      setGameState('playing')
      toast.info('Game Resumed', {
        position: "top-center",
        autoClose: 1000,
      })
    }
  }

  const resetGame = () => {
    setGameState('waiting')
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    setFood(INITIAL_FOOD)
    setScore(0)
    setLevel(1)
    setGameSpeed(200)
  }

  // Touch controls for mobile
  const handleDirectionClick = (newDirection) => {
    if (gameState !== 'playing') return
    
    setDirection(prev => {
      if (prev.x === -newDirection.x && prev.y === -newDirection.y) {
        return prev
      }
      return newDirection
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Game Board */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <motion.div
            className="retro-panel"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              {/* Game Grid */}
              <div 
                className="grid bg-black rounded-lg overflow-hidden shadow-game-board relative"
                style={{
                  gridTemplateColumns: `repeat(${boardSize.width}, 1fr)`,
                  gridTemplateRows: `repeat(${boardSize.height}, 1fr)`,
                  aspectRatio: `${boardSize.width} / ${boardSize.height}`,
                  maxWidth: '100%',
                  width: 'min(600px, 90vw)'
                }}
              >
                {/* Grid cells */}
                {Array.from({ length: boardSize.width * boardSize.height }).map((_, index) => {
                  const x = index % boardSize.width
                  const y = Math.floor(index / boardSize.width)
                  const isSnakeHead = snake[0] && snake[0].x === x && snake[0].y === y
                  const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y)
                  const isFood = food.x === x && food.y === y

                  return (
                    <motion.div
                      key={index}
                      className={`
                        border border-gray-800 relative
                        ${isSnakeHead ? 'snake-head' : ''}
                        ${isSnakeBody ? 'snake-segment' : ''}
                        ${isFood ? 'food-item animate-food-bounce' : ''}
                      `}
                      initial={false}
                      animate={isSnakeHead ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.2 }}
                    >
                      {isSnakeHead && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1 h-1 bg-black rounded-full"></div>
                        </div>
                      )}
                      {isFood && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Game Over Overlay */}
              <AnimatePresence>
                {gameState === 'gameOver' && (
                  <motion.div
                    className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <ApperIcon name="Skull" className="w-16 h-16 text-neon-pink mx-auto mb-4 animate-pulse-neon" />
                        <h3 className="text-2xl sm:text-3xl font-game text-neon-pink mb-2 neon-text">
                          Game Over!
                        </h3>
                        <p className="text-neon-green mb-4">Final Score: {score}</p>
                        {score === highScore && score > 0 && (
                          <p className="text-neon-yellow mb-4 animate-glow">New High Score!</p>
                        )}
                        <button
                          onClick={startGame}
                          className="game-button neon-button-green"
                        >
                          Play Again
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Paused Overlay */}
              <AnimatePresence>
                {gameState === 'paused' && (
                  <motion.div
                    className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-center">
                      <ApperIcon name="Pause" className="w-12 h-12 text-neon-blue mx-auto mb-4" />
                      <h3 className="text-xl font-game text-neon-blue neon-text">
                        Paused
                      </h3>
                      <p className="text-gray-300 mt-2">Press Space or Resume to continue</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Waiting to Start Overlay */}
              <AnimatePresence>
                {gameState === 'waiting' && (
                  <motion.div
                    className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity
                        }}
                      >
                        <ApperIcon name="Play" className="w-16 h-16 text-neon-green mx-auto mb-4" />
                      </motion.div>
                      <h3 className="text-2xl sm:text-3xl font-game text-neon-green mb-4 neon-text">
                        Ready to Slither?
                      </h3>
                      <p className="text-gray-300 mb-6 text-sm sm:text-base">
                        Use WASD or Arrow Keys to control your snake
                      </p>
                      <button
                        onClick={startGame}
                        className="game-button neon-button-green"
                      >
                        Start Game
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Mobile Touch Controls */}
          <div className="block sm:hidden mt-6">
            <div className="retro-panel">
              <h4 className="text-center text-neon-green font-game mb-4">Touch Controls</h4>
              <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
                <div></div>
                <button
                  className="aspect-square bg-neon-green bg-opacity-20 border border-neon-green rounded-lg flex items-center justify-center active:bg-opacity-40 transition-all"
                  onTouchStart={() => handleDirectionClick({ x: 0, y: -1 })}
                >
                  <ApperIcon name="ChevronUp" className="w-6 h-6 text-neon-green" />
                </button>
                <div></div>
                
                <button
                  className="aspect-square bg-neon-green bg-opacity-20 border border-neon-green rounded-lg flex items-center justify-center active:bg-opacity-40 transition-all"
                  onTouchStart={() => handleDirectionClick({ x: -1, y: 0 })}
                >
                  <ApperIcon name="ChevronLeft" className="w-6 h-6 text-neon-green" />
                </button>
                <div className="aspect-square"></div>
                <button
                  className="aspect-square bg-neon-green bg-opacity-20 border border-neon-green rounded-lg flex items-center justify-center active:bg-opacity-40 transition-all"
                  onTouchStart={() => handleDirectionClick({ x: 1, y: 0 })}
                >
                  <ApperIcon name="ChevronRight" className="w-6 h-6 text-neon-green" />
                </button>
                
                <div></div>
                <button
                  className="aspect-square bg-neon-green bg-opacity-20 border border-neon-green rounded-lg flex items-center justify-center active:bg-opacity-40 transition-all"
                  onTouchStart={() => handleDirectionClick({ x: 0, y: 1 })}
                >
                  <ApperIcon name="ChevronDown" className="w-6 h-6 text-neon-green" />
                </button>
                <div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Controls & Stats */}
        <div className="lg:col-span-1 order-1 lg:order-2 space-y-4 lg:space-y-6">
          {/* Stats Panel */}
          <motion.div
            className="retro-panel"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-game text-neon-green mb-4 neon-text">Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Score:</span>
                <span className="text-neon-green font-game text-lg">{score}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Level:</span>
                <span className="text-neon-blue font-game text-lg">{level}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Length:</span>
                <span className="text-neon-pink font-game text-lg">{snake.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">High Score:</span>
                <span className="text-neon-yellow font-game text-lg">{highScore}</span>
              </div>
            </div>
          </motion.div>

          {/* Controls Panel */}
          <motion.div
            className="retro-panel"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-lg font-game text-neon-green mb-4 neon-text">Controls</h3>
            <div className="space-y-3">
              {gameState === 'waiting' && (
                <button
                  onClick={startGame}
                  className="w-full game-button neon-button-green flex items-center justify-center space-x-2"
                >
                  <ApperIcon name="Play" className="w-5 h-5" />
                  <span>Start</span>
                </button>
              )}
              
              {gameState === 'playing' && (
                <button
                  onClick={togglePause}
                  className="w-full game-button neon-button-pink flex items-center justify-center space-x-2"
                >
                  <ApperIcon name="Pause" className="w-5 h-5" />
                  <span>Pause</span>
                </button>
              )}
              
              {gameState === 'paused' && (
                <button
                  onClick={togglePause}
                  className="w-full game-button neon-button-green flex items-center justify-center space-x-2"
                >
                  <ApperIcon name="Play" className="w-5 h-5" />
                  <span>Resume</span>
                </button>
              )}
              
              <button
                onClick={resetGame}
                className="w-full game-button neon-button-pink flex items-center justify-center space-x-2"
                disabled={gameState === 'waiting'}
              >
                <ApperIcon name="RotateCcw" className="w-5 h-5" />
                <span>Reset</span>
              </button>
            </div>
          </motion.div>

          {/* Instructions Panel */}
          <motion.div
            className="retro-panel hidden sm:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3 className="text-lg font-game text-neon-green mb-4 neon-text">How to Play</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <ApperIcon name="Keyboard" className="w-4 h-4 text-neon-blue" />
                <span>Use WASD or Arrow Keys</span>
              </div>
              <div className="flex items-center space-x-2">
                <ApperIcon name="Target" className="w-4 h-4 text-neon-pink" />
                <span>Collect pink orbs to grow</span>
              </div>
              <div className="flex items-center space-x-2">
                <ApperIcon name="Zap" className="w-4 h-4 text-neon-yellow" />
                <span>Avoid walls and yourself</span>
              </div>
              <div className="flex items-center space-x-2">
                <ApperIcon name="TrendingUp" className="w-4 h-4 text-neon-green" />
                <span>Speed increases with level</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default MainFeature