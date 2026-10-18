const mongoose = require("mongoose");
const { ALL_PERMISSIONS } = require("../config/permissions");

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[a-z][a-z0-9_]*$/,
                "Role name may only contain lowercase letters, numbers and underscores",
            ],
        },
        displayName: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        permissions: {
            type: [String],
            default: [],
            validate: {
                validator: (values) =>
                    values.every((value) => ALL_PERMISSIONS.includes(value)),
                message: "One or more permissions are not recognised",
            },
        },
        // System roles (admin, editor, ...) cannot be deleted and their name
        // cannot be changed. They CAN still have permissions edited, except
        // the admin role which is protected in the service layer.
        isSystem: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Role = mongoose.model("Role", roleSchema);
module.exports = Role;
