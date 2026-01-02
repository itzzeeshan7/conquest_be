export const resetPasswordMail = (link: string): string => {
    return `If you want reset account password then please follow link below: <br> <a href="${link}">${link}</a>`
}
