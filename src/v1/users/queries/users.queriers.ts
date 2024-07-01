export const queryFetchUsers = {
    Profiles: {
        select: {
            id: true,
            role: true,
            active: true,
        },
    },
    Avatar: true,
};
