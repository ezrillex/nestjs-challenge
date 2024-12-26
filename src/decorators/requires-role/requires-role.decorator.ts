import { SetMetadata } from '@nestjs/common';
import { roles } from '@prisma/client';

export const ROLE_REQUIRED = 'rolesRequired';
/*  Note: This cannot be used with public/private endpoint. The endpoint should
    manage multiple roles itself. example:
    if(!request.user){
      public flow
    else if (request.user.role === 'customer')
      customer code flow
    else if (request.user.role === 'manager')
      manager code flow
    else {
      maybe error out?

    // code after should do shared code. such as pagination for example
    return data
 */
export const RequiresRole = (role: roles) => SetMetadata(ROLE_REQUIRED, role);
