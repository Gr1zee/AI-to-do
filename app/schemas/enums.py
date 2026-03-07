import enum


class ProjectRole(str, enum.Enum):
    EDITOR = "editor"
    VIEWER = "viewer"
