const { createGroup , getUserGroups , getGroupById , addMember , removeMember , deleteGroup} =  require("../services/groupService");
const { createGroupSchema , addMemberSchema} = require("../validators/groupValidator");

const createGroupController = async (req,res) =>{
    try {
        const validation = createGroupSchema.safeParse(req.body);
        if(!validation.success){
            return res.status(400).json({
                message: "Invalid Group Data",
                errors: validation.error.issues
            })
        }

        const {name} = validation.data;   // javascript destructuring
        const group = await createGroup(name , req.userId);

        return res.status(201).json({
            message: "Group Created Successfully" , group
        })



    } catch (error) {
        console.error("Group Creation Erro" , error)

        return res.status(500).json({
            message: "Internal Server Error"
        })
        
    }


}

const getUserGroupsController = async (req,res) =>{
        try {
            const groups = await getUserGroups(req.userId);

            return res.status(200).json({
                message:"Group Fetched Successfully" , 
                groups
            })
            
        } catch (error) {

            console.error("Get User Groups Error" , error);

            return res.status(500).json({
                message: "Internal Server Error"
            })
            
        }



}

const getGroupByIdController = async (req,res) =>{
        try {
            const { groupId } = req.params;

            

            console.log("GROUP ID:", groupId);
            console.log("USER ID:", req.userId);

            const group = await getGroupById(groupId, req.userId);

            console.log("FOUND GROUP:", group);

           // const group = await getGroupById(groupId,req.userId)

            if(!group){
                return res.status(404).json({
                    message:"Group not found"
                })
            }

            return res.status(200).json({
                message:"Group found Successfully",
                group
            })
            
        } catch (error) {
            console.error("Get Group Error" , error)

            return res.status(500).json({
                message:"Internal Server Error"
            })
            
        }

}

const addMemberController = async (req,res) =>{
    try {
        const validation = addMemberSchema.safeParse(req.body);
        
        if(!validation.success){
            return res.status(400).json({
                message: "Invalid Member Data", 
                error: validation.error.issues
            })
        }
        
        const {email} = validation.data;
        const {groupId} = req.params;

        const result = await addMember(groupId,email,req.userId);

         if (result.error === "GROUP_NOT_FOUND_OR_NOT_MEMBER") {
            return res.status(404).json({
                message: "Group not found or you are not a member"
            });
        }

        if (result.error === "USER_NOT_FOUND") {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (result.error === "USER_ALREADY_MEMBER") {
            return res.status(409).json({
                message: "User is already a member"
            });
        }

        return res.status(200).json({
            message: "Member added successfully",
            group: result.group
        });
  
    } catch (error) {
        console.error("Add Member Error" , error)

        return res.status(500).json({
            message:"Internal Server Error"
        })
        
    }
}

const removeMemberController = async (req, res) => {
    try {
        const { groupId, memberId } = req.params

        const result = await removeMember(
            groupId,
            memberId,
            req.userId
        )

        if (result.error) {
            return res.status(400).json(result)
        }

        return res.status(200).json(result)

    } catch (error) {
        console.error("Remove Member Error:", error)

        return res.status(500).json({
            error: "INTERNAL_SERVER_ERROR"
        })
    }
}

const deleteGroupController = async (req, res) => {
    try {
        const { groupId } = req.params

        const result = await deleteGroup(
            groupId,
            req.userId
        )

        if (result.error) {
            return res.status(400).json(result)
        }

        return res.status(200).json(result)

    } catch (error) {
        console.error("Delete Group Error:", error)

        return res.status(500).json({
            error: "INTERNAL_SERVER_ERROR"
        })
    }
}




module.exports = { createGroupController , getUserGroupsController ,getGroupByIdController ,addMemberController  , removeMemberController , deleteGroupController}