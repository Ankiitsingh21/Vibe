interface pageProps{
        params:Promise<{
                projectId:String
        }>
}

const page= async ({params}:pageProps)=>{
        const {projectId} = await params;
        return (
                <div>
                        Project Id:{projectId}
                </div>
        )
}

export default page;