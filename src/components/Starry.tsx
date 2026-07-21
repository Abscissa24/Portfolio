import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

type ParticlesProps = {
  className?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleDensity?: number;
  opacity?: number;
};

const Starry = ({
  className,
  minSize,
  maxSize,
  speed,
  particleDensity,
  opacity,
}: ParticlesProps) => {
  const [particleColor, setParticleColor] = useState("#000");
  const controls = useAnimation();
  // The live tsParticles container, once loaded. Kept in a ref (not
  // state) so pausing/resuming it never triggers a re-render or
  // changes the `options` prop identity below - that matters because a
  // changed `options` reference makes <Particles> reinitialize the
  // whole field with fresh random positions instead of freezing it in
  // place. Reduced motion is handled by calling container.pause()/
  // .play() directly instead.
  const containerRef = useRef<Container | undefined>(undefined);
  const reducedMotionRef = useRef(false);

  // Matches the duration of the initial load-in fade below, so toggling
  // reduced motion on feels like the exact reverse of that fade rather
  // than a different transition.
  const FADE_SECONDS = 1;

  useEffect(() => {
    const updateFromHtmlClass = () => {
      const root = document.documentElement;
      setParticleColor(root.classList.contains("dark") ? "#FFF" : "#000");

      const reduced = root.classList.contains("reduce-motion");
      if (reduced === reducedMotionRef.current) return;
      reducedMotionRef.current = reduced;
      const container = containerRef.current;
      if (!container) return;
      if (reduced) {
        // Fade out first, then pause once fully invisible - the
        // reverse of the load-in fade, rather than just freezing the
        // field mid-motion. Only pause if reduced motion is still on
        // once the fade finishes (it may have been toggled back off
        // mid-fade).
        controls
          .start({
            opacity: 0,
            transition: { duration: FADE_SECONDS },
          })
          .then(() => {
            if (reducedMotionRef.current) container.pause();
          });
      } else {
        container.play();
        controls.start({
          opacity: opacity || 1,
          transition: { duration: FADE_SECONDS },
        });
      }
    };
    updateFromHtmlClass();

    const observer = new MutationObserver(updateFromHtmlClass);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const particlesLoaded = useCallback(
    async (container?: Container) => {
      if (!container) return;
      containerRef.current = container;
      // Cover the case where reduced motion is already on before this
      // fires: stay paused and invisible instead of loading in, since
      // reduced motion means faded out (see updateFromHtmlClass above).
      if (reducedMotionRef.current) {
        container.pause();
        return;
      }
      await controls.start({
        opacity: opacity || 1,
        transition: { duration: 1, delay: 2 },
      });
    },
    [controls, opacity],
  );

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fullScreen: {
        enable: true,
        zIndex: -1,
      },
      // 120 was overkill for a decorative background layer - most
      // displays cap out at 60-90Hz anyway, and on the ones that don't
      // (120Hz+ phones/monitors) rendering the field twice as often as
      // needed just burns extra main-thread/GPU budget that competes
      // with everything else on the page, including click handling for
      // nav links. 60 is visually identical on the vast majority of
      // screens and leaves more headroom for actual interactions.
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            // Was `false` in the original - reduced motion freezes the
            // whole container via .pause()/.play() (see above), so this
            // is left statically on rather than made to depend on
            // reducedMotion: doing that in `options` would make
            // <Particles> reinitialize the whole field on every toggle
            // instead of just freezing it in place.
            enable: true,
            mode: "repulse",
          },
          // `resize` takes an { enable, delay } object, not a boolean -
          // the previous `true as any` compiled, but silently discarded
          // the value (loadProperty read `data.enable` off of `true`,
          // which is undefined, so it just fell back to the built-in
          // default). Passing the real shape here removes the type
          // hack and makes the debounce delay explicit and tunable.
          resize: {
            enable: true,
            delay: 0.5,
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          repulse: {
            // The repulse engine adds `speed * factor` (clamped to
            // maxSpeed) straight to each particle's position every
            distance: 80,
            duration: 0.4,
            factor: 20,
            maxSpeed: 12,
            // Restore was off entirely before, so once a particle got
            // pushed it just stayed displaced (movement speed is only
            // 0.1-1px/frame, so drifting back on its own could take a
            // very long time) - that read as the field "getting stuck"
            // rather than flowing. Turning it on eases particles back
            // to their pre-repulse position once the cursor moves away.
            restore: {
              enable: true,
              speed: 0.4,
              delay: 0,
            },
          },
        },
      },
      particles: {
        bounce: {
          horizontal: {
            value: 1,
          },
          vertical: {
            value: 1,
          },
        },
        collisions: {
          absorb: {
            speed: 2,
          },
          bounce: {
            horizontal: {
              value: 1,
            },
            vertical: {
              value: 1,
            },
          },
          enable: false,
          maxSpeed: 50,
          mode: "bounce",
          overlap: {
            enable: true,
            retries: 0,
          },
        },
        color: {
          value: particleColor,
          animation: {
            h: {
              count: 0,
              enable: false,
              speed: 1,
              decay: 0,
              delay: 0,
              sync: true,
              offset: 0,
            },
            s: {
              count: 0,
              enable: false,
              speed: 1,
              decay: 0,
              delay: 0,
              sync: true,
              offset: 0,
            },
            l: {
              count: 0,
              enable: false,
              speed: 1,
              decay: 0,
              delay: 0,
              sync: true,
              offset: 0,
            },
          },
        },
        effect: {
          close: true,
          fill: true,
          options: {},
          type: {} as any,
        },
        groups: {},
        move: {
          angle: {
            offset: 0,
            value: 90,
          },
          attract: {
            distance: 200,
            enable: false,
            rotate: {
              x: 3000,
              y: 3000,
            },
          },
          center: {
            x: 50,
            y: 50,
            mode: "percent",
            radius: 0,
          },
          decay: 0,
          distance: {},
          direction: "none",
          drift: 0,
          enable: true,
          gravity: {
            acceleration: 9.81,
            enable: false,
            inverse: false,
            maxSpeed: 50,
          },
          path: {
            clamp: true,
            delay: {
              value: 0,
            },
            enable: false,
            options: {},
          },
          outModes: {
            default: "out",
          },
          random: false,
          size: false,
          speed: {
            min: 0.1,
            max: 1,
          },
          spin: {
            acceleration: 0,
            enable: false,
          },
          straight: false,
          trail: {
            enable: false,
            length: 10,
            fill: {},
          },
          vibrate: false,
          warp: false,
        },
        number: {
          density: {
            enable: true,
            width: 400,
            height: 400,
          },
          limit: {
            mode: "delete",
            value: 0,
          },
          value: particleDensity || 120,
        },
        opacity: {
          value: {
            min: 0.1,
            max: 1,
          },
          animation: {
            count: 0,
            enable: true,
            speed: speed || 4,
            decay: 0,
            delay: 0,
            sync: false,
            mode: "auto",
            startValue: "random",
            destroy: "none",
          },
        },
        reduceDuplicates: false,
        shadow: {
          blur: 0,
          color: {
            value: "#000",
          },
          enable: false,
          offset: {
            x: 0,
            y: 0,
          },
        },
        shape: {
          close: true,
          fill: true,
          options: {},
          type: "circle",
        },
        size: {
          value: {
            min: minSize || 1,
            max: maxSize || 3,
          },
          animation: {
            count: 0,
            enable: false,
            speed: 5,
            decay: 0,
            delay: 0,
            sync: false,
            mode: "auto",
            startValue: "random",
            destroy: "none",
          },
        },
        stroke: {
          width: 0,
        },
        zIndex: {
          value: 0,
          opacityRate: 1,
          sizeRate: 1,
          velocityRate: 1,
        },
        destroy: {
          bounds: {},
          mode: "none",
          split: {
            count: 1,
            factor: {
              value: 3,
            },
            rate: {
              value: {
                min: 4,
                max: 9,
              },
            },
            sizeOffset: true,
          },
        },
        roll: {
          darken: {
            enable: false,
            value: 0,
          },
          enable: false,
          enlighten: {
            enable: false,
            value: 0,
          },
          mode: "vertical",
          speed: 25,
        },
        tilt: {
          value: 0,
          animation: {
            enable: false,
            speed: 0,
            decay: 0,
            sync: false,
          },
          direction: "clockwise",
          enable: false,
        },
        twinkle: {
          lines: {
            enable: false,
            frequency: 0.05,
            opacity: 1,
          },
          particles: {
            enable: false,
            frequency: 0.05,
            opacity: 1,
          },
        },
        wobble: {
          distance: 5,
          enable: false,
          speed: {
            angle: 50,
            move: 10,
          },
        },
        life: {
          count: 0,
          delay: {
            value: 0,
            sync: false,
          },
          duration: {
            value: 0,
            sync: false,
          },
        },
        rotate: {
          value: 0,
          animation: {
            enable: false,
            speed: 0,
            decay: 0,
            sync: false,
          },
          direction: "clockwise",
          path: false,
        },
        orbit: {
          animation: {
            count: 0,
            enable: false,
            speed: 1,
            decay: 0,
            delay: 0,
            sync: false,
          },
          enable: false,
          opacity: 1,
          rotation: {
            value: 45,
          },
          width: 1,
        },
        links: {
          blink: false,
          color: {
            value: "#FFF",
          },
          consent: false,
          distance: 100,
          enable: false,
          frequency: 1,
          opacity: 1,
          shadow: {
            blur: 5,
            color: {
              value: "#000",
            },
            enable: false,
          },
          triangles: {
            enable: false,
            frequency: 1,
          },
          width: 1,
          warp: false,
        },
        repulse: {
          value: 0,
          enabled: false,
          distance: 1,
          duration: 1,
          factor: 1,
          speed: 1,
        },
      },
      detectRetina: true,
    }),
    [minSize, maxSize, speed, particleDensity, opacity, particleColor],
  );

  return (
    <ParticlesProvider init={loadSlim}>
      <motion.div animate={controls} className={cn("opacity-0", className)}>
        <Particles
          // @tsparticles/react's own reinit-on-options-change effect
          // has no error handling on the reload promise, and doesn't
          // guard against a second reload starting for the same id
          // before a prior one has resolved. Either one is a
          // plausible way for a theme toggle to silently never bring
          // the field back. Keying on particleColor forces React to
          // fully unmount the old instance (running its real cleanup,
          // destroying its container) before mounting a fresh one for
          // the new color, so there's no way for two loads to
          // overlap for the same DOM id, and no way for a reload of
          // the SAME instance to fail without something new getting a
          // clean shot at it right after.
          key={particleColor}
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={options}
        />
      </motion.div>
    </ParticlesProvider>
  );
};

export default Starry;
