export function Input({ className = "", ...props }) {
return (
<input
{...props}
className={`w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
/>
);
}