import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M20 3C11.163 3 4 8.477 4 15.2c0 5.52 4.43 10.36 10.73 12.36C16.36 30.41 18.8 35 20 35s3.64-4.59 5.27-7.44C31.57 25.56 36 20.72 36 15.2 36 8.477 28.837 3 20 3Zm0 4c6.075 0 11 3.64 11 8.2 0 3.91-3.57 7.27-8.42 8.1L21 23.5h-2l-1.58-.2C12.57 22.47 9 19.11 9 15.2 9 10.64 13.925 7 20 7Z"
                fill="currentColor"
            />
            <path
                d="M20 10c-3.866 0-7 2.272-7 5.2 0 2.77 2.46 5.07 5.65 5.44l1.35.16 1.35-.16C24.54 20.27 27 17.97 27 15.2c0-2.928-3.134-5.2-7-5.2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="17.5" cy="15" r="1.5" fill="currentColor" />
            <circle cx="22.5" cy="15" r="1.5" fill="currentColor" />
        </svg>
    );
}
