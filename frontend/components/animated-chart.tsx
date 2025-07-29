'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ChartBar {
    height: number
    x: number
    y: number
    delay: number
    id: string
}

export const AnimatedChart: React.FC = () => {
    const [chartGroups, setChartGroups] = useState<ChartBar[][]>([])

    useEffect(() => {
        // Generate multiple chart groups flowing across the screen
        const generateChartGroups = (): ChartBar[][] => {
            const groups = []

            // Create 8 chart groups spread across the screen
            for (let groupIndex = 0; groupIndex < 8; groupIndex++) {
                const barsInGroup = 6 + Math.floor(Math.random() * 4) // 6-10 bars per group
                const group: ChartBar[] = []

                for (let i = 0; i < barsInGroup; i++) {
                    group.push({
                        height: Math.random() * 60 + 20, // 20-80% height
                        x: groupIndex * 200 + i * 12, // Spread groups horizontally
                        y: 50 + groupIndex * 80, // Stagger vertically
                        delay: groupIndex * 0.2 + i * 0.05,
                        id: `${groupIndex}-${i}`,
                    })
                }
                groups.push(group)
            }

            return groups
        }

        setChartGroups(generateChartGroups())

        // Regenerate chart groups periodically
        const interval = setInterval(() => {
            setChartGroups(generateChartGroups())
        }, 4000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Animated flowing chart groups */}
            {chartGroups.map((group, groupIndex) => (
                <motion.div
                    key={groupIndex}
                    className="absolute"
                    initial={{ x: -200, y: window.innerHeight }}
                    animate={{
                        x: window.innerWidth + 200,
                        y: -200
                    }}
                    transition={{
                        duration: 15 + Math.random() * 10, // 15-25 seconds
                        delay: groupIndex * 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        left: `${groupIndex * 150}px`,
                        top: `${200 + groupIndex * 100}px`
                    }}
                >
                    <div className="flex items-end gap-1">
                        {group.map((bar) => (
                            <motion.div
                                key={bar.id}
                                className="bg-gradient-to-t from-green-500/20 to-green-400/40 rounded-t-sm border border-green-500/30"
                                style={{ width: '8px' }}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{
                                    height: `${bar.height}px`,
                                    opacity: [0, 0.8, 0.8, 0]
                                }}
                                transition={{
                                    duration: 2,
                                    delay: bar.delay,
                                    ease: "easeOut",
                                    repeat: Infinity,
                                    repeatDelay: 3
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            ))}

            {/* Additional floating chart elements */}
            {Array.from({ length: 15 }).map((_, index) => (
                <motion.div
                    key={`float-${index}`}
                    className="absolute w-3 h-3 bg-green-500/20 rounded-full"
                    initial={{
                        x: -50,
                        y: window.innerHeight + 50,
                        scale: 0
                    }}
                    animate={{
                        x: window.innerWidth + 50,
                        y: -50,
                        scale: [0, 1, 1, 0]
                    }}
                    transition={{
                        duration: 20 + Math.random() * 15,
                        delay: index * 1.5,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        left: `${index * 100}px`,
                    }}
                />
            ))}

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full" style={{
                    backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px',
                    transform: 'skew(-12deg)'
                }} />
            </div>
        </div>
    )
}