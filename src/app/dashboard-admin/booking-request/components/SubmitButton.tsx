// src/app/components/SubmitButton.tsx
'use client';

import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
    buttonText: string;
    className?: string;
    disabled?: boolean;
    action?: (formData: FormData) => Promise<void>;
    variant?: 'primary' | 'danger' | 'blue';
}

export function SubmitButton({ buttonText, action, variant = 'primary', className }: SubmitButtonProps) {
    const { pending } = useFormStatus();

    const getVariantClasses = () => {
        switch (variant) {
            case 'danger':
                return 'bg-red-500 hover:bg-red-600 text-white';
            case 'blue':
                return 'bg-blue-600 hover:bg-blue-700 text-white';
            default:
                return 'bg-emerald-600 hover:bg-emerald-700 text-white';
        }
    };

    const baseClasses = 'w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:text-white';
    const variantClasses = getVariantClasses();
    const finalClasses = className || `${baseClasses} ${variantClasses}`;

    return (
        <button
            formAction={action}
            type="submit"
            className={finalClasses}
            disabled={pending}
        >
            {pending ? 'Memproses...' : buttonText}
        </button>
    );
}