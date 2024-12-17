"use client";
import { FaUser, FaUserMd, FaCapsules } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const UserType: React.FC = () => {
    const router = useRouter();

    // Define the type of the navigation target (to: string) for the handleClick function
    const handleClick = (to: string): void => {
        router.push(to);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#173b2b] to-[#2a5c46] p-4">
            <div className="flex space-x-[6vw]">
                <div className="w-[24vw] h-[24vw] bg-gray-200 rounded-[20px] flex flex-col items-center justify-center gap-4 p-4 transform transition-all hover:scale-[1.02]">
                    
                    <FaUserMd className="text-gray-500 text-[5vw]" />
                    <h2 className="text-[3vw] text-gray-600">Doctor</h2>
                    <button
                        className="w-full px-4 py-2 bg-[#173b2b] text-white rounded-md hover:bg-[#133224] transform transition-all hover:scale-[1.02]"
                        onClick={() => handleClick("/pages/register_doctor")}
                    >
                        Proceed Forward
                    </button>
                </div>
                <div className="w-[24vw] h-[24vw] bg-gray-200 rounded-[20px] flex flex-col items-center justify-center gap-4 p-4 transform transition-all hover:scale-[1.02]">
                <FaUser className="text-gray-500 text-[5vw]" />
                    <h2 className="text-[3vw] text-gray-600">General</h2>
                    <button
                        className="w-full px-4 py-2 bg-[#173b2b] text-white rounded-md hover:bg-[#133224] transform transition-all hover:scale-[1.02]"
                        onClick={() => handleClick("/pages/register_user")}
                    >
                        Proceed Forward
                    </button>
                </div>
                <div className="w-[24vw] h-[24vw] bg-gray-200 rounded-[20px] flex flex-col items-center justify-center gap-4 p-4 transform transition-all hover:scale-[1.02]">
                    <FaCapsules className="text-gray-500 text-[5vw]" />
                    <h2 className="text-[3vw] text-gray-600">Pharmacist</h2>
                    <button
                        className="w-full px-4 py-2 bg-[#173b2b] text-white rounded-md hover:bg-[#133224] transform transition-all hover:scale-[1.02]"
                        onClick={() => handleClick("/pages/register_pharmacist")}
                    >
                        Proceed Forward
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserType;
