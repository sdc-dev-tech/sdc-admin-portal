import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { baseURL } from "@/services/api";

interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  showIcon?: boolean;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = "",
  showIcon = true,
}) => {
  const [imageExists, setImageExists] = useState<boolean | null>(null);
  useEffect(() => {
    const checkImage = async () => {
      if (
        !src ||
        typeof src !== "string" ||
        src.trim() === "" ||
        src === "/upload/image/undefined"
      ) {
        setImageExists(false);
        return;
      }

      try {
        const newSrc = `${baseURL}${src}`;
        const response = await fetch(newSrc, { method: "HEAD" });
        setImageExists(response.ok);
      } catch (err) {
        setImageExists(false);
      }
    };

    checkImage();
  }, [src]);

  if (imageExists === null) {
    return (
      <div
        className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}
      >
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
      </div>
    );
  }

  if (imageExists) {
    return <img src={`${src}`} alt={alt} className={className} />;
  }
  return (
    <div
      className={`bg-gray-100 border-2 flex items-center justify-center ${className}`}
    >
      {showIcon && <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />}
    </div>
  );
};

export default ImageWithFallback;
