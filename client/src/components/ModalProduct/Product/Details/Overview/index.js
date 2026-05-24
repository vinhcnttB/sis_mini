import React, { useState } from "react";
import cn from "classnames";
import styles from "./Overview.module.sass";
import Icon from "../../../../Icon";

const Overview = ({ item }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        if (!item.uniqueCode) return;
        navigator.clipboard.writeText(item.uniqueCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Chưa cập nhật";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const teachers = item.teachers || [];
    const students = item.students || [];
    const maxStudents = item.maximumStudents || 50;
    const fillPercent = Math.min(100, Math.round((students.length / maxStudents) * 100));

    return (
        <div className={styles.overview}>
            {/* Header section with Class Name, Code and Status */}
            <div className={styles.header}>
                <div className={styles.headerMain}>
                    <div className={cn("h3", styles.title)}>{item.name}</div>
                    <div className={styles.badgeRow}>
                        {!item.isDisabled ? (
                            <span className={cn("status-green", styles.status)}>Đang hoạt động</span>
                        ) : (
                            <span className={cn("status-red", styles.status)}>Tạm dừng</span>
                        )}
                        <span className={styles.createdAt}>
                            <Icon name="calendar" size="16" />
                            <span>Tạo ngày: {formatDate(item.createdAt)}</span>
                        </span>
                    </div>
                </div>
                
                {/* Class Code Box with Copy functionality */}
                {item.uniqueCode && (
                    <div className={styles.codeBox} onClick={handleCopyCode} title="Click để sao chép mã lớp">
                        <span className={styles.codeLabel}>MÃ LỚP</span>
                        <span className={styles.codeValue}>{item.uniqueCode}</span>
                        <button className={cn(styles.copyBtn, { [styles.copied]: copied })}>
                            <Icon name={copied ? "check" : "copy"} size="16" />
                        </button>
                        {copied && <span className={styles.tooltip}>Đã sao chép!</span>}
                    </div>
                )}
            </div>

            <div className={styles.row}>
                {/* Left Column: Description */}
                <div className={styles.col}>
                    <div className={styles.section}>
                        <div className={cn("title-red", styles.subtitle)}>
                            <Icon name="info" size="18" />
                            Giới thiệu chung
                        </div>
                        <div className={styles.descBox}>
                            <p className={styles.descriptionText}>
                                {item.description || "Lớp học này chưa có mô tả chi tiết từ giảng viên."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Statistics, Teachers & Students */}
                <div className={styles.col}>
                    <div className={styles.section}>
                        <div className={cn("title-purple", styles.subtitle)}>
                            <Icon name="board" size="18" />
                            Thông số & Thống kê
                        </div>
                        
                        {/* Enrollment Progress Bar */}
                        <div className={styles.statItem}>
                            <div className={styles.statHeader}>
                                <span className={styles.statLabel}>Sĩ số học viên</span>
                                <span className={styles.statValue}>
                                    <strong>{students.length}</strong> / {maxStudents} học sinh
                                </span>
                            </div>
                            <div className={styles.progressBar}>
                                <div 
                                    className={styles.progressFill} 
                                    style={{ width: `${fillPercent}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Teachers List */}
                        <div className={styles.memberSection}>
                            <span className={styles.sectionLabel}>Giảng viên phụ trách</span>
                            {teachers.length === 0 ? (
                                <div className={styles.noMember}>Chưa có giáo viên giảng dạy</div>
                            ) : (
                                <div className={styles.teachersList}>
                                    {teachers.map((teacher, index) => {
                                        const fullName = teacher.firstName && teacher.lastName
                                            ? `${teacher.firstName} ${teacher.lastName}`
                                            : (teacher.name || "Giảng viên");
                                        return (
                                            <div className={styles.teacherCard} key={teacher.id || index}>
                                                <div className={styles.avatar}>
                                                    {teacher.avatar ? (
                                                        <img src={teacher.avatar} alt={fullName} />
                                                    ) : (
                                                        <span className={styles.avatarText}>
                                                            {fullName.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={styles.teacherInfo}>
                                                    <div className={styles.teacherName}>{fullName}</div>
                                                    <div className={styles.teacherEmail}>{teacher.email}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Students Preview (Avatar group style) */}
                        <div className={styles.memberSection}>
                            <span className={styles.sectionLabel}>Học sinh tham gia ({students.length})</span>
                            {students.length === 0 ? (
                                <div className={styles.noMember}>Chưa có học sinh tham gia</div>
                            ) : (
                                <div className={styles.studentsPreview}>
                                    <div className={styles.avatarGroup}>
                                        {students.slice(0, 5).map((student, index) => {
                                            const name = student.firstName && student.lastName
                                                ? `${student.firstName} ${student.lastName}`
                                                : (student.name || "Học sinh");
                                            return (
                                                <div 
                                                    className={styles.avatarMini} 
                                                    key={student.id || index}
                                                    title={name}
                                                >
                                                    {student.avatar ? (
                                                        <img src={student.avatar} alt={name} />
                                                    ) : (
                                                        <span className={styles.avatarMiniText}>
                                                            {name.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {students.length > 5 && (
                                            <div className={styles.avatarMore} title={`Và ${students.length - 5} học sinh khác`}>
                                                +{students.length - 5}
                                            </div>
                                        )}
                                    </div>
                                    <span className={styles.studentNote}>
                                        {students.length > 5 
                                            ? `Đã tham gia (và ${students.length - 5} học sinh khác)` 
                                            : "Đã tham gia lớp học"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
