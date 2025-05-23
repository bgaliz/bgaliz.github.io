import Image from "next/image";
import BackgroundImage from "@/shared/img/backgroundImage.jpg"

export const HomePage = () => {
    return (
        <section className="w-[100%] h-[100%]">
            <Image 
                className="w-[100%] max-h-screen object-cover blur-md top-0 absolute z-[-1] object-[0%_10%]" 
                src={BackgroundImage} alt="background-image.jpg"
            />

            <div>
                <div>
                    <h1 className="text-lg">
                        Bruno Galiz
                    </h1>
                </div>

                <div>
                    {/* Arrow */}
                    <h3>Desenvolvedor Front-end</h3>
                    <h3>Freelance</h3>
                    <span>Open to Work</span>
                </div>
            </div>
        </section>
    )
}