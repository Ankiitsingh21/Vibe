// "use client"
import Link from "next/link"
import { CrownIcon } from "lucide-react"
import { formatDuration,intervalToDuration } from "date-fns"
import { Button } from "@/components/ui/button"
import { useAuth } from "@clerk/nextjs"

interface Props{
        points:number,
        msBeforeNext:number
}

export const Usage = ({points,msBeforeNext}:Props)=>{
        const {has} = useAuth();
        const hasPro = has?.({plan:"pro"})
        return (
                <div className="rounded-t-xl bg-background border border-b-0 p-2.5" >
                        <div className="flex items-center gap-x-2" >
                                <div>
                                        <p className="text-sm" >
                                                {points} {hasPro?"":"free"}credit remaining
                                        </p>
                                        <p className="text-sm text-muted-foreground " >
                                                Resets in{" "}
                                                {formatDuration(
                                                        intervalToDuration({
                                                                start:new Date(),
                                                                end:new Date(Date.now() + msBeforeNext),
                                                        }),
                                                        {
                                                                format:["months","days","hours"]
                                                        }
                                                )}
                                        </p>
                                </div>
                                <Button className="ml-auto" variant={"tertiary"}  asChild size={"sm"}>
                                        <Link href="/pricing" >
                                           <CrownIcon/> Upgrade
                                        </Link>
                                </Button>
                        </div>
                </div>
        )
}
