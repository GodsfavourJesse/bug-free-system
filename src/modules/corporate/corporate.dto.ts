export interface CreateCorporateAnnouncementDto {
    title: string;
    message: string;
    isPublished?: boolean;
}

export interface UpdateCorporateAnnouncementDto {
    title?: string;
    message?: string;
    isPublished?: boolean;
}