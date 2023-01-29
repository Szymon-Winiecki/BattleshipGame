const { FlexLayout, QWidget } = require("@nodegui/nodegui");

function Row(id = "row"){
    const row = new QWidget();
    const rowLayout = new FlexLayout();
    row.setLayout(rowLayout);
    row.setObjectName(id);
    row.setInlineStyle("flex-direction: 'row';");

    return [row, rowLayout];
}

function Column(id = "column"){
    const column = new QWidget();
    const columnLayout = new FlexLayout();
    column.setLayout(columnLayout);
    column.setObjectName(id);
    column.setInlineStyle("flex-direction: 'column';");

    return [column, columnLayout];
}

module.exports = {
    Row,
    Column
}