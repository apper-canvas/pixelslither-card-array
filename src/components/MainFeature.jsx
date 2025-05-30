import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'

const GRID_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION = { x: 1, y: 0 }
const INITIAL_FOOD = { x: 5, y: 5 }

// Level configurations
const LEVEL_CONFIGS = {
  beginner: {
    name: 'Beginner',
    speed: 300,
    obstacles: 0,
    boardSize: { width: 25, height: 18 },
    layoutType: 'empty',
    description: 'Perfect for first-time players',
    icon: 'Heart',
    color: 'neon-green'
  },
  mazeRunner: {
    name: 'Maze Runner',
    speed: 200,
    obstacles: 12,
    boardSize: { width: 30, height: 20 },
    layoutType: 'maze',
    description: 'Navigate through maze walls',
    icon: 'Map',
    color: 'neon-blue'
  },
  speedDemon: {
    name: 'Speed Demon',
    speed: 120,
    obstacles: 4,
    boardSize: { width: 28, height: 18 },
    layoutType: 'scattered',
    description: 'Fast-paced challenge',
    icon: 'Zap',
    color: 'neon-yellow'
  },
  nightmare: {
    name: 'Nightmare',
    speed: 100,
    obstacles: 18,
    boardSize: { width: 24, height: 16 },
    layoutType: 'border',
    description: 'Ultimate challenge for experts',
    icon: 'Skull',
    color: 'neon-pink'
  }
}
const MainFeature = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [direction, setDirection] = useState(INITIAL_DIRECTION)
  const [food, setFood] = useState(INITIAL_FOOD)
const [gameState, setGameState] = useState('levelSelection') // levelSelection, waiting, playing, paused, gameOver
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
const [selectedLevel, setSelectedLevel] = useState(null)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('pixelslither-highscore')
    return saved ? parseInt(saved) : 0
  })
  const [gameSpeed, setGameSpeed] = useState(200)
const [boardSize, setBoardSize] = useState({ width: 30, height: 20 })
  const [obstacles, setObstacles] = useState([])

const gameLoopRef = useRef()
  const canvasRef = useRef()
  const directionQueueRef = useRef([])
  const currentDirectionRef = useRef(INITIAL_DIRECTION)

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
// Generate obstacles based on selected level
// Generate level layout based on level configuration
  const generateLevelLayout = useCallback((config, currentSnake, currentFood) => {
    if (config.obstacles === 0) return []
    
    const { width, height } = config.boardSize
    const newObstacles = []
    
    // Helper function to check if position is valid
    const isValidPosition = (x, y) => {
      return !currentSnake.some(segment => segment.x === x && segment.y === y) &&
             !(currentFood && currentFood.x === x && currentFood.y === y) &&
             !newObstacles.some(obs => obs.x === x && obs.y === y) &&
             !(Math.abs(x - 10) < 3 && Math.abs(y - 10) < 3) // Avoid starting position
    }
    
    switch (config.layoutType) {
      case 'maze':
        // Create maze-like walls
        for (let x = 5; x < width - 5; x += 4) {
          for (let y = 3; y < height - 3; y += 3) {
            if (isValidPosition(x, y)) newObstacles.push({ x, y })
            if (isValidPosition(x + 1, y) && Math.random() > 0.5) newObstacles.push({ x: x + 1, y })
            if (isValidPosition(x, y + 1) && Math.random() > 0.5) newObstacles.push({ x, y: y + 1 })
          }
        }
        // Add some vertical walls
        for (let y = 2; y < height - 2; y += 6) {
          for (let i = 0; i < 3; i++) {
            const x = Math.floor(width / 3) + i
            if (isValidPosition(x, y)) newObstacles.push({ x, y })
            if (isValidPosition(x, y + 1)) newObstacles.push({ x, y: y + 1 })
          }
        }
        break
        
      case 'border':
        // Create border obstacles with gaps
        const borderGaps = [
          Math.floor(width * 0.25),
          Math.floor(width * 0.5),
          Math.floor(width * 0.75)
        ]
        
        // Top and bottom borders with gaps
        for (let x = 0; x < width; x++) {
          if (!borderGaps.includes(x)) {
            if (isValidPosition(x, 2)) newObstacles.push({ x, y: 2 })
            if (isValidPosition(x, height - 3)) newObstacles.push({ x, y: height - 3 })
          }
        }
        
        // Side borders with gaps
        const verticalGaps = [Math.floor(height * 0.3), Math.floor(height * 0.7)]
        for (let y = 0; y < height; y++) {
          if (!verticalGaps.includes(y)) {
            if (isValidPosition(2, y)) newObstacles.push({ x: 2, y })
            if (isValidPosition(width - 3, y)) newObstacles.push({ x: width - 3, y })
          }
        }
        
        // Add some scattered obstacles in the middle
        for (let i = 0; i < 8; i++) {
          let attempts = 0
          let obstacle
          do {
            obstacle = {
              x: Math.floor(Math.random() * (width - 8)) + 4,
              y: Math.floor(Math.random() * (height - 8)) + 4
            }
            attempts++
          } while (attempts < 20 && !isValidPosition(obstacle.x, obstacle.y))
          
          if (attempts < 20) newObstacles.push(obstacle)
        }
        break
        
      case 'scattered':
      default:
        // Scattered random obstacles
        for (let i = 0; i < config.obstacles; i++) {
          let obstacle
          let attempts = 0
          do {
            obstacle = {
              x: Math.floor(Math.random() * width),
              y: Math.floor(Math.random() * height)
            }
            attempts++
          } while (attempts < 50 && !isValidPosition(obstacle.x, obstacle.y))
          
          if (attempts < 50) {
            newObstacles.push(obstacle)
          }
        }
        break
    }
    
    return newObstacles.slice(0, config.obstacles) // Ensure we don't exceed the obstacle limit
  }, [])

  // Legacy obstacle generation for backward compatibility
  const generateObstacles = useCallback((obstacleCount, currentSnake, currentFood) => {
    if (obstacleCount === 0) return []
    
    const newObstacles = []
    
    for (let i = 0; i < obstacleCount; i++) {
      let obstacle
      let attempts = 0
      do {
        obstacle = {
          x: Math.floor(Math.random() * boardSize.width),
          y: Math.floor(Math.random() * boardSize.height)
        }
        attempts++
      } while (
        attempts < 50 && (
          currentSnake.some(segment => segment.x === obstacle.x && segment.y === obstacle.y) ||
          (currentFood && currentFood.x === obstacle.x && currentFood.y === obstacle.y) ||
          newObstacles.some(obs => obs.x === obstacle.x && obs.y === obstacle.y) ||
          // Avoid placing obstacles too close to starting position
          (Math.abs(obstacle.x - 10) < 3 && Math.abs(obstacle.y - 10) < 3)
        )
      )
      
      if (attempts < 50) {
        newObstacles.push(obstacle)
      }
    }
    
    return newObstacles
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
        
        // Add to direction queue instead of setting immediately
        const currentDir = currentDirectionRef.current
        const lastQueuedDir = directionQueueRef.current.length > 0 
          ? directionQueueRef.current[directionQueueRef.current.length - 1] 
          : currentDir

        // Prevent reversing into self
        if (lastQueuedDir.x === -newDirection.x && lastQueuedDir.y === -newDirection.y) {
          return
        }

        // Only add if different from last queued direction
        if (lastQueuedDir.x !== newDirection.x || lastQueuedDir.y !== newDirection.y) {
          directionQueueRef.current.push(newDirection)
          // Keep queue limited to prevent excessive buffering
          if (directionQueueRef.current.length > 3) {
            directionQueueRef.current.shift()
          }
        }
      }

      if (e.key === ' ') {
        e.preventDefault()
        togglePause()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
}, [gameState])
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

    
    gameLoopRef.current = setInterval(() => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake]
        const head = { ...newSnake[0] }
        
        head.x += direction.x
        head.y += direction.y

// Process direction queue
        if (directionQueueRef.current.length > 0) {
          const nextDirection = directionQueueRef.current.shift()
          currentDirectionRef.current = nextDirection
          setDirection(nextDirection)
        }

        // Check wall collision - immediate game over
        if (head.x < 0 || head.x >= boardSize.width || head.y < 0 || head.y >= boardSize.height) {
          clearInterval(gameLoopRef.current)
          setGameState('gameOver')
          return prevSnake
        }

        // Check obstacle collision - immediate game over
        if (obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
          clearInterval(gameLoopRef.current)
          setGameState('gameOver')
          return prevSnake
        }

        // Check self collision - immediate game over
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          clearInterval(gameLoopRef.current)
          setGameState('gameOver')
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

const selectLevel = (levelKey) => {
    setSelectedLevel(levelKey)
    setGameState('waiting')
    toast.success(`${LEVEL_CONFIGS[levelKey].name} Level Selected!`, {
      position: "top-center",
      autoClose: 1500,
    })
  }

  const startGame = () => {
    if (!selectedLevel) return
    
    const config = LEVEL_CONFIGS[selectedLevel]
    setSnake(INITIAL_SNAKE)
setDirection({ x: 1, y: 0 })
    currentDirectionRef.current = { x: 1, y: 0 }
    directionQueueRef.current = []
    setFood(generateFood(INITIAL_SNAKE))
    setScore(0)
    setLevel(1)
    setGameSpeed(config.speed)
setObstacles(generateLevelLayout(config, INITIAL_SNAKE, generateFood(INITIAL_SNAKE)))
    setGameState('playing')
    toast.info(`${config.name} Game Started! Use WASD or Arrow Keys`, {
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
    setGameState('levelSelection')
    setSelectedLevel(null)
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    setFood(INITIAL_FOOD)
    setScore(0)
    setLevel(1)
    setGameSpeed(200)
    setObstacles([])
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
const isObstacle = obstacles.some(obstacle => obstacle.x === x && obstacle.y === y)

                  return (
                    <motion.div
                      key={index}
                      className={`
                        border border-gray-800 relative
                        ${isSnakeHead ? 'snake-head' : ''}
                        ${isSnakeBody ? 'snake-segment' : ''}
${isFood ? 'food-item animate-food-bounce' : ''}
                        ${isObstacle ? 'obstacle' : ''}
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
{/* Level Selection Overlay */}
              <AnimatePresence>
                {gameState === 'levelSelection' && (
                  <motion.div
                    className="absolute inset-0 bg-black bg-opacity-95 flex items-center justify-center rounded-lg p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-center max-w-4xl w-full">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <h2 className="text-3xl sm:text-4xl font-game text-neon-green mb-8 neon-text">
                          Choose Your Level
                        </h2>
                        
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-4xl mx-auto">
                          {Object.entries(LEVEL_CONFIGS).map(([key, config]) => (
                            <motion.div
                              key={key}
                              className={`level-card level-card-${key}`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => selectLevel(key)}
                            >
                              <ApperIcon 
                                name={config.icon} 
                                className={`w-12 h-12 text-${config.color} mx-auto mb-3`} 
                              />
                              <h3 className={`text-xl font-game text-${config.color} mb-2 neon-text`}>
                                {config.name}
                              </h3>
                              <p className="text-gray-300 mb-3 text-xs">
                                {config.description}
                              </p>
                              <div className="space-y-1 text-xs text-gray-400">
                                <div>Layout: {config.layoutType === 'empty' ? 'Open' : config.layoutType}</div>
                                <div>Board: {config.boardSize.width}×{config.boardSize.height}</div>
                                <div>Speed: {config.speed > 250 ? 'Slow' : config.speed > 150 ? 'Medium' : 'Fast'}</div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        
                        <p className="text-gray-400 mt-6 text-sm">
                          Select a difficulty level to begin your slithering adventure
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
{selectedLevel && (
                        <p className={`text-${LEVEL_CONFIGS[selectedLevel].color} mb-2 font-game`}>
                          {LEVEL_CONFIGS[selectedLevel].name} Level Selected
                        </p>
                      )}
                      <p className="text-gray-300 mb-6 text-sm sm:text-base">
Snake moves automatically - use WASD to change direction
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
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default MainFeature