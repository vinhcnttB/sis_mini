import React from "react";

const FormInput = ({
    type,
    name,
    title,
    placeholder,
    value,
    onChange,
    error,
    disabled,
}) => {
    return (
        <div className="mb-2">
            <label htmlFor="password">{title}</label>
            <input
                type={type}
                placeholder={placeholder}
                className="form-control"
                value={value !== undefined ? value : ""}
                onChange={onChange}
                name={name}
                disabled={disabled}
            />
            {error !== "" ? <p className="text-danger">{error}</p> : null}
        </div>
    );
};

export default FormInput;
