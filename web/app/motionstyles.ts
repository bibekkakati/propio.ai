export const fadeRow = (index = 0): any => ({
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: {
        duration: 0.25,
        ease: "easeOut",
        delay: index * 0.03,
    },
});
