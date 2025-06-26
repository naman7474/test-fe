import React, { useEffect, useState, useRef, Suspense } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring, useAnimationFrame } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, OrbitControls, Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Custom hook for device orientation (mobile)
const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 });
  
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      setOrientation({ beta: e.beta || 0, gamma: e.gamma || 0 });
    };
    
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);
  
  return orientation;
};

// Holographic text component
const HolographicText = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 blur-lg opacity-70">
      {children}
    </div>
    <div className="relative text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300">
      {children}
    </div>
  </div>
);

// Liquid button with morphing effect
const LiquidButton = ({ children, onClick, className = "" }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"
        animate={{
          scale: isHovered ? 1.5 : 1,
          rotate: isHovered ? 180 : 0,
        }}
        transition={{ duration: 0.5 }}
        style={{ filter: 'blur(20px)' }}
      />
      
      {/* Liquid effect */}
      <svg className="absolute inset-0 w-full h-full" style={{ filter: 'url(#goo)' }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
          </filter>
        </defs>
        {[...Array(5)].map((_, i) => (
          <motion.circle
            key={i}
            cx="50%"
            cy="50%"
            r="30%"
            fill="url(#gradient)"
            animate={{
              cx: isHovered ? `${50 + (Math.random() - 0.5) * 40}%` : '50%',
              cy: isHovered ? `${50 + (Math.random() - 0.5) * 40}%` : '50%',
              scale: isHovered ? 0.8 + Math.random() * 0.4 : 1,
            }}
            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          />
        ))}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF1B6B" />
            <stop offset="100%" stopColor="#45CAFF" />
          </linearGradient>
        </defs>
      </svg>
      
      <span className="relative z-10 text-white font-bold px-8 py-4 block">
        {children}
      </span>
    </motion.button>
  );
};

// 3D Face Model Component
const FaceModel = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = mouse.y * 0.5;
      meshRef.current.rotation.y = mouse.x * 0.5;
      meshRef.current.position.z = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 32, 32]}>
        <MeshDistortMaterial
          color="#FF1B6B"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
      
      {/* Scanning effect */}
      <mesh>
        <planeGeometry args={[3, 0.01]} />
        <meshBasicMaterial color="#45CAFF" transparent opacity={0.5} />
      </mesh>
    </Float>
  );
};

// Neural network background
const NeuralNetwork = () => {
  const points = useRef<THREE.Points>(null);
  const particlesCount = 500;
  
  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);
  
  for (let i = 0; i < particlesCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    
    colors[i * 3] = Math.random();
    colors[i * 3 + 1] = Math.random();
    colors[i * 3 + 2] = Math.random();
  }
  
  useFrame((state) => {
    if (points.current) {
      points.current.rotation.x = state.clock.elapsedTime * 0.1;
      points.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });
  
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.01} vertexColors />
    </points>
  );
};

// Main Landing Component
const FuturisticLanding = () => {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const orientation = useDeviceOrientation();
  
  // Cursor light effect
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const springX = useSpring(cursorX, { stiffness: 200, damping: 20 });
  const springY = useSpring(cursorY, { stiffness: 200, damping: 20 });
  
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Hero Section with 3D
  const HeroSection = () => {
    const titleY = useTransform(scrollYProgress, [0, 0.3], [0, -200]);
    const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <NeuralNetwork />
              <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            </Suspense>
          </Canvas>
        </div>

        {/* Cursor light effect */}
        {!isMobile && (
          <motion.div
            className="fixed w-96 h-96 rounded-full pointer-events-none z-50"
            style={{
              x: springX,
              y: springY,
              left: '-192px',
              top: '-192px',
              background: 'radial-gradient(circle, rgba(255,27,107,0.1) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
        )}

        {/* Glitch effect overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute inset-0"
            animate={{
              opacity: [0, 0.1, 0],
              scaleX: [1, 1.05, 1],
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatDelay: 5,
            }}
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
            }}
          />
        </div>

        <motion.div 
          style={{ y: titleY, opacity }}
          className="relative z-10 max-w-7xl mx-auto px-6 text-center"
        >
          {/* Holographic badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50" />
              <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full">
                <span className="text-sm font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  NEXT-GEN BEAUTY TECH
                </span>
              </div>
            </div>
          </motion.div>

          {/* Main headline with holographic effect */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 relative">
              <HolographicText className="font-display">
                YOUR FACE
              </HolographicText>
              <motion.div
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #FF1B6B, #45CAFF, #FFD700, #FF1B6B)',
                  backgroundSize: '200% 100%',
                }}
              >
                DECODED
              </motion.div>
            </h1>
          </motion.div>

          {/* Animated subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            <motion.span
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              AI-powered skincare from the future
            </motion.span>
          </motion.p>

          {/* Futuristic CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <LiquidButton onClick={() => navigate('/login')} className="text-lg">
              INITIALIZE ANALYSIS →
            </LiquidButton>
          </motion.div>

          {/* Floating stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-8"
          >
            {[
              { value: '10K+', label: 'USERS' },
              { value: '97%', label: 'ACCURACY' },
              { value: '23s', label: 'ANALYSIS' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {stat.value}
                </div>
                <div className="text-xs font-mono text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Mobile gyroscope effect */}
        {isMobile && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `rotateX(${orientation.beta * 0.1}deg) rotateY(${orientation.gamma * 0.1}deg)`,
            }}
          >
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl" />
          </motion.div>
        )}

        {/* Animated scroll indicator */}
        <motion.div
          animate={{
            y: [0, 20, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-purple-500/50 rounded-full flex justify-center relative overflow-hidden">
            <motion.div
              animate={{
                y: [-10, 20],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
              className="w-1 h-3 bg-gradient-to-b from-purple-500 to-transparent rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>
    );
  };

  // Interactive Science Section
  const ScienceSection = () => (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(#FF1B6B 1px, transparent 1px),
              linear-gradient(90deg, #45CAFF 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <HolographicText>FACE MAPPING TECHNOLOGY</HolographicText>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 3D Face Scanner */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-96"
          >
            <Canvas>
              <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <FaceModel />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
              </Suspense>
            </Canvas>
            
            {/* Holographic overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
              />
            </div>
          </motion.div>

          {/* Tech specs with animations */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              { title: 'NEURAL PROCESSING', value: '468 POINTS', icon: '🧠' },
              { title: 'ACCURACY RATE', value: '99.7%', icon: '🎯' },
              { title: 'ANALYSIS SPEED', value: '0.023s', icon: '⚡' },
              { title: 'AI MODELS', value: '12 ACTIVE', icon: '🤖' },
            ].map((spec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 10 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-mono">{spec.title}</p>
                      <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        {spec.value}
                      </p>
                    </div>
                    <div className="text-4xl">{spec.icon}</div>
                  </div>
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: '0%' }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );

  // Futuristic Features Grid
  const FeaturesGrid = () => (
    <section className="py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <HolographicText>FEATURE MATRIX</HolographicText>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'NEURAL ANALYSIS',
              desc: 'Deep learning models analyze your unique facial structure',
              icon: '🧬',
              color: 'from-purple-500 to-pink-500',
            },
            {
              title: 'QUANTUM MATCHING',
              desc: 'Algorithm matches you with perfect products instantly',
              icon: '⚛️',
              color: 'from-blue-500 to-purple-500',
            },
            {
              title: 'PREDICTIVE AI',
              desc: 'Forecasts your skin changes before they happen',
              icon: '🔮',
              color: 'from-pink-500 to-red-500',
            },
            {
              title: 'BIORHYTHM SYNC',
              desc: 'Adapts routine to your circadian rhythm',
              icon: '🌙',
              color: 'from-indigo-500 to-purple-500',
            },
            {
              title: 'MOLECULAR MAP',
              desc: 'Ingredient compatibility at the molecular level',
              icon: '🧪',
              color: 'from-green-500 to-blue-500',
            },
            {
              title: 'HOLOGRAPHIC VIEW',
              desc: '3D visualization of your skin improvements',
              icon: '🎭',
              color: 'from-yellow-500 to-pink-500',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative group"
            >
              {/* Holographic card effect */}
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
              />
              
              <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full overflow-hidden">
                {/* Animated background pattern */}
                <motion.div
                  className="absolute inset-0 opacity-5"
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />
                
                <div className="relative z-10">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r mb-3"
                    style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
                
                {/* Corner accent */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.color} opacity-20 blur-2xl`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  // Mobile-specific crazy interactions
  const MobileInteractions = () => {
    if (!isMobile) return null;
    
    return (
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">
              <HolographicText>TOUCH TO EXPLORE</HolographicText>
            </h2>
            <p className="text-gray-400">Swipe, tap, and shake for surprises</p>
          </motion.div>

          {/* Interactive cards */}
          <div className="space-y-4">
            {['Swipe for magic', 'Tap to reveal', 'Hold to transform'].map((text, i) => (
              <motion.div
                key={i}
                drag="x"
                dragConstraints={{ left: -100, right: 100 }}
                dragElastic={0.2}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl" />
                <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 p-6 rounded-xl">
                  <p className="text-center text-white font-bold">{text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Testimonials with holographic cards
  const TestimonialsSection = () => {
    const testimonials = [
      {
        name: 'ARIA_2077',
        avatar: '👤',
        quote: "It's like having a dermatologist from the future",
        result: 'SKIN CLARITY +87%',
        verified: true,
      },
      {
        name: 'NEXUS_X',
        avatar: '🤖',
        quote: "The AI understood my skin better than I do",
        result: 'AGE REVERSAL -5YRS',
        verified: true,
      },
      {
        name: 'CYBER_JANE',
        avatar: '💫',
        quote: "Absolutely mind-blowing technology",
        result: 'GLOW FACTOR +94%',
        verified: true,
      },
    ];

    return (
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <HolographicText>USER TESTIMONIALS</HolographicText>
            </h2>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.5 }}
                className="relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Holographic card */}
                <div className="relative mx-auto max-w-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl" />
                  <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-5xl">{testimonials[activeTestimonial].avatar}</div>
                      <div>
                        <p className="font-mono text-purple-400">{testimonials[activeTestimonial].name}</p>
                        {testimonials[activeTestimonial].verified && (
                          <p className="text-xs text-green-400 font-mono">✓ VERIFIED USER</p>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-2xl text-white mb-6 italic">
                      "{testimonials[activeTestimonial].quote}"
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <motion.div
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                        className="text-green-400 font-mono"
                      >
                        {testimonials[activeTestimonial].result}
                      </motion.div>
                      
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 0.5,
                              delay: i * 0.1,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                            className="text-yellow-400"
                          >
                            ⭐
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-center gap-4 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className="relative"
                >
                  <motion.div
                    animate={{
                      scale: index === activeTestimonial ? 1.5 : 1,
                    }}
                    className={`w-2 h-2 rounded-full ${
                      index === activeTestimonial
                        ? 'bg-gradient-to-r from-purple-400 to-pink-400'
                        : 'bg-gray-600'
                    }`}
                  />
                  {index === activeTestimonial && (
                    <motion.div
                      animate={{
                        scale: [1, 2, 1],
                        opacity: [1, 0, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="absolute inset-0 w-2 h-2 rounded-full bg-purple-400"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Final CTA with epic effects
  const FinalCTASection = () => (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]"
        >
          <div className="absolute inset-0 bg-gradient-conic from-purple-500 via-pink-500 to-purple-500 opacity-20 blur-3xl" />
        </motion.div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            <HolographicText>READY TO EVOLVE?</HolographicText>
          </h2>
          
          <p className="text-xl text-gray-400 mb-12">
            Join the skincare revolution
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <LiquidButton onClick={() => navigate('/login')} className="text-lg">
              START TRANSFORMATION
            </LiquidButton>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group overflow-hidden px-8 py-4 rounded-full"
            >
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 text-white font-bold">VIEW DEMO</span>
            </motion.button>
          </div>

          {/* Live counter */}
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="inline-block"
          >
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full">
              <p className="text-sm font-mono text-purple-400">
                🟢 {Math.floor(Math.random() * 50) + 100} USERS ONLINE NOW
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      <HeroSection />
      <ScienceSection />
      <FeaturesGrid />
      <MobileInteractions />
      <TestimonialsSection />
      <FinalCTASection />
    </div>
  );
};

export default FuturisticLanding;