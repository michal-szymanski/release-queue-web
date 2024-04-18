import { Variants } from 'framer-motion';

export const variants: Variants = {
    hidden: {
        opacity: 0,
        transition: { ease: 'easeInOut', duration: 0.25 }
    },
    visible: {
        opacity: 1,
        transition: { ease: 'easeInOut', duration: 0.25, delay: 0.25 }
    },
    'size-small': {
        scale: 0.98,
        transition: { ease: 'easeInOut', duration: 0.25 }
    },
    'size-normal': {
        scale: 1,
        transition: { ease: 'easeInOut', duration: 0.25, delay: 0.25 }
    }
};
