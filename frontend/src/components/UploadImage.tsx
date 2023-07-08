import Image from "next/image";
import { Dispatch, SetStateAction } from "react";


export default function UploadImage(
  {
    artworkURL, 
    setArtworkURL,
  }:
  {
    artworkURL: string;
    setArtworkURL: Dispatch<SetStateAction<string>>;
  }
) {
  

  const uploadArtwork = async (e?: React.ChangeEvent<HTMLInputElement>) => {
    if (!e) {
      const fileInput = document.createElement('input');
      return (
        (fileInput.type = 'file'),
        (fileInput.accept = 'image/png, image/gif, image/jpeg, image/webp, image/webm'),
        fileInput.click(),
        void (fileInput.onchange = function (e: React.ChangeEvent<HTMLInputElement>) {
          uploadArtwork(e);
        })
      );
    }

    const file = e.target.files?.[0]!
    const filename = encodeURIComponent(file.name)
    const fileType = encodeURIComponent(file.type)
  
    const res = await fetch(
      `/api/upload-url?file=${filename}&fileType=${fileType}`
    );
    
    const { url, fields } = await res.json()
    const formData = new FormData()
  
    Object.entries({ ...fields, file }).forEach(([key, value]) => {
      formData.append(key, value as string)
    })
  
    const upload = await fetch(url, {
      method: 'POST',
      body: formData,
    })
  
    if (upload.ok) {
      console.log('Uploaded successfully!',  await upload)

      setArtworkURL(`https://${process.env.NEXT_PUBLIC_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${filename}`);
    } else {
      console.error('Upload failed.',  await upload)
    }
  }

  return (
    <>
      <label className="font-bold flex justify-center md:justify-start">Artwork</label>
      {artworkURL !== "" ? (
        <div 
          className="showButtonHover cursor-pointer relative mx-auto"
          onClick={() => uploadArtwork()}
        >
        <button
          title="Edit"
          className="buttonHidden absolute hidden bg-white rounded p-1 right-[94px] top-10 mt-2"
        >Change Media</button>
        <Image className="mt-2 w-[300px]" width={300} height={300} src={artworkURL} alt="Artwork" />
      </div>
      ) : (
        <div className="flex flex-col flex-wrap justify-center">
          <div
              className="flex flex-col justify-center items-center w-full h-64 cursor-pointer rounded-lg border border-gray-700 bg-slate-100 hover:bg-slate-300 mt-2 p-4"
              onClick={() => uploadArtwork()}
          >
              <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 149 132" className="h-6 w-6 md:h-12 md:w-12">
              <path d="M143.209,105.968c0,6.25-5.113,11.364-11.363,11.364H18.203c-6.25 0-11.363-5.113-11.363-11.364v-86.37c0-6.25,5.113-11.363 11.363-11.363h113.643c6.25,0,11.363,5.113,11.363,11.363V105.968z M18.203,17.326c-1.207,0-2.271,1.068-2.271,2.271v86.37c0,1.207,1.065 2.271,2.271,2.271h113.643c1.203,0,2.274-1.064 2.274-2.271v-86.37c0-1.203-1.071-2.271-2.274-2.271H18.203z M38.661,53.691c-7.529,0-13.641-6.108-13.641-13.635s6.112-13.638,13.641-13.638 c7.526,0,13.632,6.111,13.632,13.638S46.188,53.691,38.661,53.691z M125.025,99.15H25.02V85.51l22.73-22.724l11.363,11.36l36.365-36.361l29.547,29.547V99.15z"></path>
              </svg>
              <span className="text-sm mt-2">Add token media</span>
              <span className="text-xs">(.jpg, .png, .gif, .webp, .webm) (MAX 1MB)</span>
          </div>
      </div>
      )}
      
    </>
  )
}