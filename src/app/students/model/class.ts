export interface Class{
    id:number,
    className : string,
    isDel : number,
    isActive : number
}

export interface Section{
    id:number,
    classId : number,
    sectionId:number,
    className:string,
    sectionName : string
}