"use client"

import type React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import { Sparkles } from "lucide-react"

interface LiquidMetalButtonProps {
  label?: string
  onClick?: () => void
  href?: string
  viewMode?: "text" | "icon"
  width?: number
  className?: string
  children?: React.ReactNode
  disabled?: boolean
  type?: "button" | "submit"
  fullWidth?: boolean
  target?: string
  rel?: string
}

export function LiquidMetalButton({
  label = "Generate",
  onClick,
  href,
  viewMode = "text",
  width,
  className,
  children,
  disabled = false,
  type = "button",
  fullWidth = false,
  target,
  rel,
}: LiquidMetalButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const shaderRef = useRef<HTMLDivElement>(null)
  const shaderMount = useRef<any>(null)
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
  const rippleId = useRef(0)

  const dimensions = useMemo(() => {
    const h = 46
    if (viewMode === "icon") {
      return {
        width: fullWidth ? "100%" : 46,
        height: h,
        innerWidth: fullWidth ? "calc(100% - 4px)" : 42,
        innerHeight: 42,
        shaderWidth: fullWidth ? "100%" : 46,
        shaderHeight: h,
      }
    }
    if (fullWidth) {
      return {
        width: "100%" as const,
        height: h,
        innerWidth: "calc(100% - 4px)" as const,
        innerHeight: 42,
        shaderWidth: "100%" as const,
        shaderHeight: h,
      }
    }
    const targetWidth = width ?? 142
    return {
      width: targetWidth,
      height: h,
      innerWidth: targetWidth - 4,
      innerHeight: 42,
      shaderWidth: targetWidth,
      shaderHeight: h,
    }
  }, [viewMode, width, fullWidth])

  const toSize = (v: number | string) => (typeof v === "number" ? `${v}px` : v)

  useEffect(() => {
    const styleId = "shader-canvas-style-exploded"
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style")
      style.id = styleId
      style.textContent = `
        .shader-container-exploded {
          pointer-events: none !important;
          z-index: 0 !important;
          contain: paint !important;
          isolation: isolate !important;
        }
        .shader-container-exploded canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 100px !important;
          z-index: 0 !important;
          pointer-events: none !important;
          contain: strict !important;
        }
        @keyframes ripple-animation {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
      `
      document.head.appendChild(style)
    }

    const loadShader = async () => {
      try {
        const { liquidMetalFragmentShader, ShaderMount } = await import("@paper-design/shaders")

        if (shaderRef.current) {
          if (shaderMount.current?.destroy) {
            shaderMount.current.destroy()
          }

          // Add a small delay to ensure the DOM is ready and the dark fill is painted first
          setTimeout(() => {
            if (shaderRef.current) {
              shaderMount.current = new ShaderMount(
                shaderRef.current,
                liquidMetalFragmentShader,
                {
                  u_repetition: 4,
                  u_softness: 0.5,
                  u_shiftRed: 0.3,
                  u_shiftBlue: 0.3,
                  u_distortion: 0,
                  u_contour: 0,
                  u_angle: 45,
                  u_scale: 8,
                  u_shape: 1,
                  u_offsetX: 0.1,
                  u_offsetY: -0.1,
                },
                undefined,
                0.6,
              )
            }
          }, 100)
        }
      } catch (error) {
        console.error("[LiquidMetalButton] Failed to load shader:", error)
      }
    }

    loadShader()

    return () => {
      if (shaderMount.current?.destroy) {
        shaderMount.current.destroy()
        shaderMount.current = null
      }
    }
  }, [dimensions.width, dimensions.height])

  const handleMouseEnter = () => {
    setIsHovered(true)
    shaderMount.current?.setSpeed?.(1)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setIsPressed(false)
    shaderMount.current?.setSpeed?.(0.6)
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement & HTMLAnchorElement>) => {
    if (disabled) return
    if (shaderMount.current?.setSpeed) {
      shaderMount.current.setSpeed(2.4)
      setTimeout(() => {
        if (isHovered) {
          shaderMount.current?.setSpeed?.(1)
        } else {
          shaderMount.current?.setSpeed?.(0.6)
        }
      }, 300)
    }

    const targetEl = e.currentTarget
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const ripple = { x, y, id: rippleId.current++ }

      setRipples((prev) => [...prev, ripple])
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
      }, 600)
    }

    onClick?.()
  }

  const displayLabel = children ?? label
  const isLink = Boolean(href)

  const interactiveProps = {
    onClick: handleClick,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onMouseDown: () => !disabled && setIsPressed(true),
    onMouseUp: () => setIsPressed(false),
    style: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      width: toSize(dimensions.width),
      height: toSize(dimensions.height),
      background: "transparent",
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      outline: "none",
      zIndex: 30,
      transformStyle: "preserve-3d" as const,
      transform: "translateZ(25px)",
      transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
      overflow: "hidden" as const,
      borderRadius: "100px",
      opacity: disabled ? 0.6 : 1,
      pointerEvents: disabled ? "none" as const : undefined,
    },
    "aria-label": typeof displayLabel === "string" ? displayLabel : label,
  }

  return (
    <div
      className={className ? `relative inline-block ${className}` : "relative inline-block"}
      style={{
        ...(fullWidth ? { width: "100%" } : {}),
        background: "transparent",
        isolation: "isolate",
      }}
    >
      <div
        style={{
          perspective: "1000px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            position: "relative",
            width: toSize(dimensions.width),
            height: toSize(dimensions.height),
            transformStyle: "preserve-3d",
            transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
            transform: "none",
            isolation: "isolate",
          }}
        >
          {/* 1. Shader layer at the back — never on top so it can't cover content when it loads */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: toSize(dimensions.width),
              height: toSize(dimensions.height),
              transformStyle: "preserve-3d",
              transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
              transform: `translateZ(0px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 0,
            }}
          >
            <div
              style={{
                height: toSize(dimensions.height),
                width: toSize(dimensions.width),
                borderRadius: "100px",
                boxShadow: isPressed
                  ? "0px 0px 0px 1px rgba(0, 0, 0, 0.5), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)"
                  : isHovered
                    ? "0px 0px 0px 1px rgba(0, 0, 0, 0.4), 0px 12px 6px 0px rgba(0, 0, 0, 0.05), 0px 8px 5px 0px rgba(0, 0, 0, 0.1), 0px 4px 4px 0px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.2)"
                    : "0px 0px 0px 1px rgba(0, 0, 0, 0.3), 0px 36px 14px 0px rgba(0, 0, 0, 0.02), 0px 20px 12px 0px rgba(0, 0, 0, 0.08), 0px 9px 9px 0px rgba(0, 0, 0, 0.12), 0px 2px 5px 0px rgba(0, 0, 0, 0.15)",
                transition:
                  "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                background: "transparent",
              }}
            >
              <div
                ref={shaderRef}
                className="shader-container-exploded"
                style={{
                  borderRadius: "100px",
                  overflow: "hidden",
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  background: "#0a0a0a",
                  transition: "width 0.4s ease, height 0.4s ease",
                }}
              />
            </div>
          </div>

          {/* 2. Dark inner fill — always above shader (Chrome: own layer so canvas never covers) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: toSize(dimensions.width),
              height: toSize(dimensions.height),
              transformStyle: "preserve-3d",
              transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
              transform: `translateZ(10px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 10,
              pointerEvents: "none",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "2px",
                width: "calc(100% - 4px)",
                height: "calc(100% - 4px)",
                borderRadius: "100px",
                background: "linear-gradient(180deg, #1a1a1a 0%, #000000 100%)",
                boxShadow: isPressed
                  ? "inset 0px 2px 4px rgba(0, 0, 0, 0.4), inset 0px 1px 2px rgba(0, 0, 0, 0.3)"
                  : "none",
                transition:
                  "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>

          {/* 3. Label / content — always on top (Chrome: own layer) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: toSize(dimensions.width),
              height: toSize(dimensions.height),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transformStyle: "preserve-3d",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, gap 0.4s ease",
              transform: "translateZ(20px)",
              zIndex: 20,
              pointerEvents: "none",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            {viewMode === "icon" ? (
              children && typeof children !== "string" ? (
                children
              ) : (
                <Sparkles
                  size={16}
                  style={{
                    color: "#ffffff",
                    filter: "drop-shadow(0px 2px 6px rgba(255, 255, 255, 0.08))",
                    transition: "all 0.4s ease",
                    transform: "scale(1)",
                  }}
                />
              )
            ) : (
              <span
                style={{
                  fontSize: "14px",
                  color: "#ffffff",
                  fontWeight: 600,
                  textShadow: "0px 2px 8px rgba(255, 255, 255, 0.06)",
                  transition: "all 0.4s ease",
                  transform: "scale(1)",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.2px",
                }}
              >
                {displayLabel}
              </span>
            )}
          </div>

          {isLink ? (
            <a
              ref={buttonRef as React.RefObject<HTMLAnchorElement>}
              href={href}
              target={target}
              rel={rel}
              {...interactiveProps}
            >
              {ripples.map((ripple) => (
                <span
                  key={ripple.id}
                  style={{
                    position: "absolute",
                    left: `${ripple.x}px`,
                    top: `${ripple.y}px`,
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
                    pointerEvents: "none",
                    animation: "ripple-animation 0.6s ease-out",
                  }}
                />
              ))}
            </a>
          ) : (
            <button
              ref={buttonRef as React.RefObject<HTMLButtonElement>}
              type={type}
              disabled={disabled}
              {...interactiveProps}
            >
              {ripples.map((ripple) => (
                <span
                  key={ripple.id}
                  style={{
                    position: "absolute",
                    left: `${ripple.x}px`,
                    top: `${ripple.y}px`,
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
                    pointerEvents: "none",
                    animation: "ripple-animation 0.6s ease-out",
                  }}
                />
              ))}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
