import { Fragment } from "@/generated/prisma"
import { useState } from "react"
import { ExternalLink , ExternalLinkIcon, RefreshCcwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props{
        data : Fragment
}

export const FragmentWeb = ({data}:Props)=>{
        const [fragmentKey , setfragmentKey] = useState(0);
        const [copied,setcopied] = useState(false)
        const onRefresh=()=>{
                setfragmentKey((prev)=>prev+1)
        }

        const handCopy =()=>{
                 navigator.clipboard.writeText(data.sandboxUrl);
                 setcopied(true);
                 setTimeout(()=>setcopied(false),2000);
        }
        return (
                <div className="flex flex-col w-full h-full" >
                        <div className="p-2 border-b bg-sidebar flex items-center gap-x-2" >
                                <Button size={"sm"} variant={"outline"} onClick={onRefresh} >
                                        <RefreshCcwIcon/>
                                </Button>
                                <Button size={"sm"} variant={"outline"} onClick={handCopy} disabled={!data.sandboxUrl || copied}  className="flex-1 justify-start text-start font - normal" >
                                        <span className="truncate" >{data.sandboxUrl}</span>
                                </Button>
                                <Button size={"sm"} variant={"outline"} disabled={!data.sandboxUrl} onClick={()=>{
                                        if(!data.sandboxUrl) return ;

                                        window.open(data.sandboxUrl,"_blank");
                                }} >
                                        <ExternalLinkIcon/>
                                </Button>
                        </div>
                        <iframe
                          className="h-full w-full"
                          sandbox="allow-forms allow-scripts allow-same-origin"
                          loading="lazy"
                          src={data.sandboxUrl}
                        />
                </div>
        )
}