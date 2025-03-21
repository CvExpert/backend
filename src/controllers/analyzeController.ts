async function checkFilePermission(fileId: string, userId: string) {
    return true
}

export async function analyzeFile(fileId: string, userId: string) {
    const permission = await checkFilePermission(fileId, userId)
    if(permission){
        console.log("User have permission")
    }
}
