"use strict"

const ASCENDING = 1 // -1 is descending

class DataForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

            // data for table
            data: [],
            filteredData: [],
            selectedData: [],
            tags: [],

            // nav info
            goalNumber: 0,

            // goal info
            title: "",
            description: "",

            // footer
            links: [],

            // mobile view
            isMobileView: window.innerWidth < 768
        }
    }

    handleResize = () => {
        this.setState({ isMobileView: window.innerWidth < 768 })
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleResize)

        fetch("json/data.json")
            .then(response => response.json())
            .then(jsonData => {
                let flattened_data = jsonData.goal.targets.flatMap(target =>
                    target.examples.map(example => ({
                        number: target.number,
                        targetDescription: target.description,
                        exampleTitle: example.title,
                        exampleDescription: example.description,
                        images: example.images,
                        tags: example.tags,
                        favourite: Math.random() < 0.5,                 // >= 0 and < 1
                        rating: Math.floor(Math.random() * 5) + 1
                    }))
                )

                let tags = jsonData.goal.targets.flatMap(target => target.examples.flatMap(example => example.tags))
                let uniqueTags = [...new Set(tags)].sort()
                uniqueTags.unshift("All Tags")

                let links = [{
                    official: jsonData.goal.links.official,
                    undp: jsonData.goal.links.undp
                }]

                this.setState({
                    data: flattened_data,
                    filteredData: flattened_data,
                    selectedData: flattened_data,
                    tags: uniqueTags,
                    goalNumber: jsonData.goal.number,
                    title: jsonData.goal.title,
                    description: jsonData.goal.description,
                    links: links
                }, () => { this.renderAll() })
            })
    }

    renderAll = () => {

        // Filter
        ReactDOM.render(
            <Filter
                tags={this.state.tags}
                data={this.state.filteredData}
                setStateFilter={(filtered) => this.setStateFilter(filtered)}
            />,
            document.getElementById("filter")
        )

        // Search
        ReactDOM.render(
            <Search onSearch={(query) => this.handleSearch(query)}/>,
            document.getElementById("search")
        )
        ReactDOM.render(
            <Search onSearch={(query) => this.handleSearch(query)}/>,
            document.getElementById("search_")
        )

        // Goal info
        ReactDOM.render(
            <GoalInfo
                title={this.state.title}
                description={this.state.description}
            />,
            document.getElementById("goal_info")
        )

        // Nav info
        ReactDOM.render(
            <NavInfo goalNumber={this.state.goalNumber}/>,
            document.getElementById("nav_info")
        )

        // Add row button
        ReactDOM.render(
            <AddRowButton
                onAddRow={(newRow) => this.handleAddRow(newRow)}
                goalNumber={this.state.goalNumber}
                tags={this.state.tags}
            />,
            document.getElementById("add_row")
        )

        // Tag manager
        ReactDOM.render(
            <TagsManagerButton
                tags={this.state.tags}
                data={this.state.data}
                handleUpdateTags={(newTags, updatedData) => this.handleUpdateTags(newTags, updatedData)}
            />,
            document.getElementById("tags_manager")
        )

        // Footer
        ReactDOM.render(
            <Footer links={this.state.links} />,
            document.getElementById("footer")
        )
    }

    handleSort = (column, direction) => {
        const sorted = [...this.state.filteredData].sort((a, b) => {
            let aVal = a[column]
            let bVal = b[column]

            if (column === "number") {
                const getSecondPart = (num) => parseInt(num.toString().split(".")[1])
                aVal = getSecondPart(a.number)
                bVal = getSecondPart(b.number)
            }

            if (aVal < bVal) return direction === ASCENDING ? -1 : 1
            if (aVal > bVal) return direction === ASCENDING ? 1 : -1
            return 0
        })

        this.setState({
            filteredData: sorted,
            selectedData: sorted,
            data: sorted
        })
    }

    setStateFilter = (filtered) => {
        this.setState({
            filteredData: filtered,
            selectedData: filtered,
            data: this.state.data
        })
    }

    handleSearch = (query) => {
        let lower = query.toLowerCase()

        let searched = this.state.data.filter(item => {
            let text = `${item.number} 
                               ${item.targetDescription} 
                               ${item.exampleTitle} 
                               ${item.exampleDescription} 
                               ${(item.tags || []).join(" ")}`
            return text.toLowerCase().includes(lower)
        })
        this.setState({ selectedData: searched })
    }

    handleAddRow = (newRow) => {
        this.setState(prev => {
            return {
                data: [...prev.data, newRow],
                filteredData: [...prev.filteredData, newRow],
                selectedData: [...prev.selectedData, newRow]
            }
        }, () => {
            this.renderAll()
        })
    }

    handleDeleteRow = (itemToDelete) => {
        if (!window.confirm(`Are you sure you want to delete "${itemToDelete.exampleTitle}"?`)) {
            return
        }

        this.setState(prev => {
            const filterOut = (array) => array.filter(d => d !== itemToDelete)

            return {
                data: filterOut(prev.data),
                filteredData: filterOut(prev.filteredData),
                selectedData: filterOut(prev.selectedData)
            }
        }, () => {
            this.renderAll()
        })
    }

    handleModifyRow = (oldItem, newItem) => {
        this.setState(prev => {
            const update = (array) =>
                array.map((d) => (d === oldItem ? newItem : d))
            return {
                data: update(prev.data),
                filteredData: update(prev.filteredData),
                selectedData: update(prev.selectedData)
            }
        }, () => {
            this.renderAll()
        })
    }

    handleUpdateTags = (newTags, updatedData = this.state.data) => {
        this.setState({
            tags: newTags,
            data: updatedData,
            filteredData: updatedData,
            selectedData: updatedData
        }, () => {
            this.renderAll()
        })
    }

    toggleFavourite = (item) => {

        // we depend on the previous state (prev)
        this.setState(prev => {
            const update = (array) =>
                array.map((d) => (
                    d === item ?
                    { ...d, favourite: !d.favourite }   // if it's the same item - flip the "favourite" value
                        : d                             // otherwise, leave it unchanged
                ))

            // Apply the update function to all three arrays in state
            const newData = update(prev.data)                 // update main data
            const newFiltered = update(prev.filteredData)     // update filtered data
            const newSelected = update(prev.selectedData)     // update selected data

            return {
                data: newData,
                filteredData: newFiltered,
                selectedData: newSelected
            }
        }, () => {
            this.renderAll()
        })
    }

    render() {
        const isMobile = this.state.isMobileView;

        return (
            <div id="container">
                {isMobile ? (
                    <DataCards
                        data={this.state.selectedData}
                        toggleFavourite={this.toggleFavourite}
                        onDeleteRow={(item) => this.handleDeleteRow(item)}
                        onModifyRow={(oldItem, newItem) => this.handleModifyRow(oldItem, newItem)}
                    />
                ) : (
                    <DataTable
                        data={this.state.selectedData}
                        toggleFavourite={this.toggleFavourite}
                        onSort={(column, direction) => this.handleSort(column, direction)}
                        onDeleteRow={(item) => this.handleDeleteRow(item)}
                        onModifyRow={(oldItem, newItem) => this.handleModifyRow(oldItem, newItem)}
                    />
                )}
            </div>
        )
    }
}

class NavInfo extends React.Component {
    render() {
        return (
            <React.Fragment>
                Goal {this.props.goalNumber}
            </React.Fragment>
        )
    }
}

class AddRowButton extends React.Component {
    constructor(props) {
        super(props)
        this.state = { showModal: false }
    }

    toggleModal = () => {
        this.setState({ showModal: !this.state.showModal })
    }

    render() {
        return (
            <React.Fragment>
                <button className="btn btn-success btn-sm ms-3" onClick={this.toggleModal}>
                    <i className="fas fa-plus"></i> Add Row
                </button>

                {this.state.showModal && (
                    <AddRowModal
                        handleClose={this.toggleModal} handleAdd={this.props.onAddRow}
                        goalNumber={this.props.goalNumber} tags={this.props.tags}
                    />
                )}
            </React.Fragment>
        )
    }
}

class AddRowModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            number: 1,
            targetDescription: "",
            exampleTitle: "",
            exampleDescription: "",
            selectedTags: [],
            rating: 1,
            images: []
        }
    }

    handleImageChange = (e) => {
        // convert the FileList into a regular array
        const files = Array.from(e.target.files)
        const imageURLs = files.map(file => URL.createObjectURL(file))
        this.setState({ images: imageURLs })
        console.log(imageURLs)
    }

    handleSubmit = () => {

        const newRow = {
            number: this.props.goalNumber + "." + this.state.number,
            targetDescription: this.state.targetDescription,
            exampleTitle: this.state.exampleTitle,
            exampleDescription: this.state.exampleDescription,
            tags: this.state.selectedTags,
            images: this.state.images,
            rating: parseInt(this.state.rating),
            favourite: false
        }

        this.props.handleAdd(newRow)
        this.props.handleClose()
    }

    componentDidMount() {
        document.body.style.overflow = "hidden"
    }

    componentWillUnmount() {
        document.body.style.overflow = ""
    }

    render() {
        const neededTags = this.props.tags.filter(tag => tag !== "All Tags")

        return (
            <div className="modal">
                <div className="modal_content" onClick={(e) => e.stopPropagation()}>
                    <form onSubmit={this.handleSubmit}>
                        <h2>Add New Row</h2>

                        <label>Number:
                            <div>
                                <span>{this.props.goalNumber}.</span>
                                <select
                                    value={this.state.number}
                                    onChange={(e) => this.setState({ number: e.target.value })}
                                >
                                    {Array.from({ length: 99 }, (_, i) => i + 1).map((num) => (
                                        <option key={num} value={num}>
                                            {num}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </label>

                        <label className="label_column">Target Description:
                            <input
                                type="text"
                                value={this.state.targetDescription}
                                onChange={(e) => this.setState({ targetDescription: e.target.value })}
                            />
                        </label>

                        <label className="label_column">Example Title:
                            <input
                                type="text"
                                value={this.state.exampleTitle}
                                onChange={(e) => this.setState({ exampleTitle: e.target.value })}
                            />
                        </label>

                        <label className="label_column">Example Description:
                            <textarea
                                value={this.state.exampleDescription}
                                onChange={(e) =>
                                    this.setState({ exampleDescription: e.target.value })
                                }
                            />
                        </label>

                        <label className="label_column">Tags:
                            <select
                                multiple
                                value={this.state.selectedTags}
                                onChange={(e) => {
                                    const selected = Array.from(
                                        e.target.selectedOptions,
                                        (option) => option.value
                                    )
                                    this.setState({ selectedTags: selected })
                                }}
                            >
                                {neededTags.map((tag) => (
                                    <option key={tag} value={tag}>
                                        {tag}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>Rating:
                            <select
                                value={this.state.rating}
                                onChange={(e) => this.setState({ rating: e.target.value })}
                            >
                                {[1, 2, 3, 4, 5].map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="label_column">Images:
                            <input type="file" multiple onChange={this.handleImageChange} />
                        </label>

                        <div>
                            <button type="submit">Add</button>
                            <button className="btn btn-secondary mt-3" type="button" onClick={this.props.handleClose}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

class TagsManagerButton extends React.Component {
    constructor(props) {
        super(props)
        this.state = { showModal: false }
    }

    toggleModal = () => {
        this.setState({ showModal: !this.state.showModal })
    }

    render() {
        return (
            <React.Fragment>
                <button className="btn btn-light btn-sm ms-3" onClick={this.toggleModal}>Tags Manager</button>

                {this.state.showModal && (
                    <TagsManagerModal
                        handleClose={this.toggleModal}
                        tags={this.props.tags}
                        data={this.props.data}
                        handleUpdateTags={this.props.handleUpdateTags}
                    />
                )}
            </React.Fragment>
        )
    }
}

class TagsManagerModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tags: this.props.tags.filter(tag => tag !== "All Tags"),
            newTag: "",
            editIndex: null,
            editValue: ""
        }
    }

    handleAddTag = () => {
        const newTag = this.state.newTag.trim()
        if (newTag && !this.state.tags.includes(newTag)) {
            const updatedTags = [...this.state.tags, newTag].sort()
            this.setState({ tags: updatedTags, newTag: "" }, () => this.updateGlobalTags(updatedTags))
        }
    }

    handleDeleteTag = (tagToDelete) => {
        const updatedTags = this.state.tags.filter(tag => tag !== tagToDelete)

        const updatedData = this.props.data.map(item => ({
            ...item,
            tags: item.tags ? item.tags.filter(t => t !== tagToDelete) : []
        }))

        this.setState({ tags: updatedTags }, () => this.updateGlobalTags(updatedTags, updatedData))
    }

    handleEditTag = (index) => {
        this.setState({ editIndex: index, editValue: this.state.tags[index] })
    }

    handleSaveEdit = () => {
        const { editIndex, editValue, tags } = this.state
        const oldTag = tags[editIndex]
        const newTag = editValue.trim()
        if (!newTag) return

        const updatedData = this.props.data.map(item => ({
            ...item,
            tags: item.tags
                ? item.tags.map(t => (t === oldTag ? newTag : t))
                : []
        }))

        const updatedTags = [...tags]
        updatedTags[editIndex] = newTag
        this.setState({ tags: updatedTags.sort(), editIndex: null, editValue: "" }, () =>
            this.updateGlobalTags(updatedTags, updatedData)
        )
    }

    updateGlobalTags = (updatedTags, updatedData) => {
        const allTags = ["All Tags", ...updatedTags]
        this.props.handleUpdateTags(allTags, updatedData)
    }

    componentDidMount() {
        document.body.style.overflow = "hidden"
    }

    componentWillUnmount() {
        document.body.style.overflow = ""
    }

    render() {
        return (
            <div className="modal" id="no_white">
                <div className="modal_content" onClick={(e) => e.stopPropagation()}>
                    <h2>Tag Manager</h2>

                    <div className="tag_list">
                        {this.state.tags.map((tag, index) => (
                            <div key={index} className="tag_item">
                                {this.state.editIndex === index ?
                                    (
                                        <label>
                                            <input
                                                type="text"
                                                value={this.state.editValue}
                                                onChange={(e) => this.setState({ editValue: e.target.value })}
                                            />
                                            <button onClick={this.handleSaveEdit}>Save</button>
                                            <button onClick={() => this.setState({ editIndex: null })}>Cancel</button>
                                        </label>
                                    ) :
                                    (
                                        <label>
                                            <span>#{tag}</span>
                                            <button onClick={() => this.handleEditTag(index)}>Edit</button>
                                            <button onClick={() => this.handleDeleteTag(tag)}>Delete</button>
                                        </label>
                                    )
                                }
                            </div>
                        ))}
                    </div>

                    <div className="tag_add_section">
                        <label>
                            <input
                                type="text"
                                value={this.state.newTag}
                                onChange={(e) => this.setState({ newTag: e.target.value })}
                                placeholder="Add new tag..."
                            />
                            <button onClick={this.handleAddTag}>Add</button>
                        </label>
                    </div>

                    <input id="closeButton" type="button" value="X" onClick={this.props.handleClose}/>

                    <button className="btn btn-secondary mt-3" onClick={this.props.handleClose}
                            style={{ marginBottom: "70px" }}>
                        Close
                    </button>
                </div>
            </div>
        )
    }
}

class GoalInfo extends React.Component {
    render() {
        return (
            <React.Fragment>
                <h1 className="mt-4">{this.props.title}</h1>
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item active">{this.props.description}</li>
                </ol>
            </React.Fragment>
        )
    }
}

class DataCards extends React.Component {
    constructor(props) {
        super(props)
        this.state = { openItem: null }
    }

    openModal = (item) => {
        this.setState({ openItem: item })
    }

    closeModal = () => {
        this.setState({ openItem: null })
    }

    render() {
        const { data, toggleFavourite, onDeleteRow, onModifyRow } = this.props
        const { openItem } = this.state

        return (
            <div className="card-container">
                {data.map((item, i) => (
                    <div
                        key={i}
                        className="data-card"
                        onClick={() => this.openModal(item)}
                    >
                        <div className="data-card-header">
                            <h4>{item.goalNumber} {item.title}</h4>
                            <img
                                src={item.favourite ? "img/delete_from_favourite.png" : "img/favourite.png"}
                                alt="fav"
                                height="25"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleFavourite(item)
                                }}
                            />
                        </div>
                        <p><strong>Target:</strong> {item.targetDescription}</p>
                        <p><strong>Description:</strong> {item.exampleDescription}</p>
                        <p><strong>Rating:</strong> {item.rating}</p>
                        <div className="card-tags">
                            {item.tags && item.tags.map((tag, k) => <span key={k}>#{tag} </span>)}
                        </div>
                        <div className="card-images">
                            {item.images && item.images.map((img, j) => (
                                <img src={img} alt={`img-${j}`} className="card-image" />
                            ))}
                        </div>
                    </div>
                ))}

                {openItem && (
                    <DataRowModal
                        data={openItem}
                        handleModal={this.closeModal}
                        toggleFavourite={toggleFavourite}
                        onDeleteRow={(row) => { onDeleteRow(row)}}
                        onModifyRow={(oldItem, newItem) => { onModifyRow(oldItem, newItem)}}
                    />
                )}
            </div>
        )
    }
}

class DataTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            sortDirection: ASCENDING,
            sortColumn: "number"
        }
    }

    handleHeaderClick = (e) => {
        let sortColumn = e.target.id
        let sortDirection = this.state.sortDirection

        if (this.state.sortColumn === sortColumn) sortDirection = -sortDirection
        else sortDirection = ASCENDING

        this.setState({ sortColumn, sortDirection })

        // call the parent's function to perform the actual sorting
        this.props.onSort(sortColumn, sortDirection)
    }

    render() {
        let data = this.props.data
        return (
            <table id="dataTable">
                <thead>
                <tr>
                    <th id="number" onClick={this.handleHeaderClick}>#
                        {this.state.sortColumn === "number" ?
                            this.state.sortDirection === ASCENDING ? "▲" : "▼" : ""}
                    </th>
                    <th id="targetDescription" onClick={this.handleHeaderClick}>Target Description
                        {this.state.sortColumn === "targetDescription" ?
                            this.state.sortDirection === ASCENDING ? "▲" : "▼" : ""}
                    </th>
                    <th id="exampleTitle" onClick={this.handleHeaderClick}>Example Title
                        {this.state.sortColumn === "exampleTitle" ?
                            this.state.sortDirection === ASCENDING ? "▲" : "▼" : ""}
                    </th>
                    <th id="exampleDescription" onClick={this.handleHeaderClick}>Example Description
                        {this.state.sortColumn === "exampleDescription" ?
                            this.state.sortDirection === ASCENDING ? "▲" : "▼" : ""}
                    </th>
                    <th>Images</th>
                    <th id="rating" onClick={this.handleHeaderClick}>Rating
                        {this.state.sortColumn === "rating" ?
                            this.state.sortDirection === ASCENDING ? "▲" : "▼" : ""}
                    </th>
                    <th>Tags</th>
                </tr>
                </thead>
                <tbody>{data.map((d, i) => (
                    <DataRow
                        key={i}
                        data={d}
                        toggleFavourite={this.props.toggleFavourite}
                        onDeleteRow={this.props.onDeleteRow}
                        onModifyRow={this.props.onModifyRow}
                    />))}
                </tbody>
            </table>
        )
    }
}

class DataRow extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            displayModal: false
        }
    }

    handleModal = () => {
        this.setState({ displayModal: !this.state.displayModal })
    }

    render() {
        let d = this.props.data
        return (
            <tr onClick={this.handleModal}>
                <td style={{backgroundColor: d.favourite ? "orange" : "inherit"}}>
                    {this.state.displayModal ?
                        <DataRowModal
                            handleModal={this.handleModal}
                            data={d}
                            toggleFavourite={this.props.toggleFavourite}
                            onDeleteRow={this.props.onDeleteRow}
                            onModifyRow={this.props.onModifyRow}
                        /> : null}
                    {d.number}
                </td>
                <td>{d.targetDescription}</td>
                <td>{d.exampleTitle}</td>
                <td>{d.exampleDescription}</td>
                <td>{d.images && d.images.map((img, j) => (
                    <img src={img} className="tableImage" alt={`image ${j + 1}`}/>))}
                </td>
                <td>{d.rating}</td>
                <td>{d.tags && d.tags.map(tag => <span className="tags">#{tag}</span>)}</td>
            </tr>
        )
    }
}

class DataRowModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            editMode: false,
            editedData: { ...props.data }
        }
    }

    componentDidMount() {
        document.body.style.overflow = "hidden"
    }

    componentWillUnmount() {
        document.body.style.overflow = ""
    }

    handleChange = (field, value) => {
        this.setState(
            {editedData: { ...this.state.editedData, [field]: value }}
        )
    }

    handleImageChange = (e) => {
        const files = Array.from(e.target.files)
        const imageURLs = files.map(file => URL.createObjectURL(file))
        this.setState(prev => ({
            editedData: {
                ...prev.editedData,
                images: [...(prev.editedData.images || []), ...imageURLs]
            }
        }))
    }

    handleDeleteImage = (index) => {
        this.setState(prev => ({
            editedData: {
                ...prev.editedData,
                images: prev.editedData.images.filter((_, i) => i !== index)
            }
        }))
    }

    handleSave = () => {
        if (this.props.onModifyRow) {
            this.props.onModifyRow(this.props.data, this.state.editedData)
        }
        this.setState({ editMode: false })
        this.props.handleModal()
    }

    render() {
        const data = this.state.editMode ? this.state.editedData : this.props.data

        return (
            <div onClick={(e) => {e.stopPropagation()}} className="modal">
                <div className="modal_content">
                    <div id="modal_header">
                        <h1>{data.number}</h1>
                        <img
                            src={data.favourite ? "img/delete_from_favourite.png" : "img/favourite.png"}
                            alt={data.favourite ? "Remove from favourites" : "Add to favourites"}
                            height="30"
                            onClick={(e) => {
                                e.stopPropagation()
                                this.props.toggleFavourite(data)
                            }}
                        />
                        {this.state.editMode ?
                            (
                                <React.Fragment>
                                    <button
                                        className="btn btn-success btn-sm ms-3"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            this.handleSave()
                                        }}
                                    >
                                        Save changes
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm ms-3"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            this.setState({
                                                editMode: false,
                                                editedData: { ...this.props.data }
                                            })
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </React.Fragment>
                            ) :
                            (
                                <button
                                    className="btn btn-warning btn-sm ms-3"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        this.setState({ editMode: true })
                                    }}
                                >
                                    Modify
                                </button>
                            )
                        }

                        <button
                            className="btn btn-danger btn-sm ms-3"
                            onClick={(e) => {
                                e.stopPropagation()
                                    this.props.onDeleteRow(this.props.data)
                                    this.props.handleModal()
                            }}
                        >
                            Delete
                        </button>
                    </div>

                    <div className="modal_div">
                        <strong>Target Description</strong>
                        {this.state.editMode ? (
                            <input
                                type="text"
                                value={data.targetDescription}
                                onChange={(e) => this.handleChange("targetDescription", e.target.value)}
                            />
                        ) : (
                            <p>: {data.targetDescription}</p>
                        )}
                    </div>

                    <div className="modal_div">
                        <strong>Example Title</strong>
                        {this.state.editMode ? (
                            <input
                                type="text"
                                value={data.exampleTitle}
                                onChange={(e) => this.handleChange("exampleTitle", e.target.value)}
                            />
                        ) : (
                            <p>: {data.exampleTitle}</p>
                        )}
                    </div>

                    <div className="modal_div">
                        <strong>Example Description</strong>
                        {this.state.editMode ? (
                            <textarea
                                value={data.exampleDescription}
                                onChange={(e) => this.handleChange("exampleDescription", e.target.value)}
                            />
                        ) : (
                            <p>: {data.exampleDescription}</p>
                        )}
                    </div>

                    <div className="modal_div">
                        <strong>Rating</strong>
                        {this.state.editMode ? (
                            <select
                                value={data.rating}
                                onChange={(e) => this.handleChange("rating", parseInt(e.target.value))}
                            >
                                {[1, 2, 3, 4, 5].map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        ) : (
                            <p>: {data.rating}</p>
                        )}
                    </div>

                    <div className="modal_div">
                        <strong>Tags</strong>
                        {this.state.editMode ? (
                            <input
                                type="text"
                                value={(data.tags || []).join(", ")}
                                onChange={(e) =>
                                    this.handleChange(
                                        "tags",
                                        e.target.value.split(",").map(t => t.trim())
                                    )}
                            />
                        ) : (
                            <p>:{data.tags && data.tags.map((tag, k) =>
                                <span className="tags" key={k}>#{tag}</span>)}</p>
                        )}
                    </div>

                    <div className="modal_div">
                        {this.state.editMode ? (
                            <React.Fragment>
                                <div className="image-list">
                                    {data.images && data.images.map((img, j) => (
                                        <div>
                                            <img className="modalTableImage" src={img} alt={`image ${j + 1}`} />
                                            <button onClick={() => this.handleDeleteImage(j)}>❌</button>
                                        </div>
                                    ))}
                                </div>
                                <input
                                    type="file" multiple
                                    onChange={this.handleImageChange}
                                />
                            </React.Fragment>
                        ) : (
                            data.images && data.images.map((img, j) => (
                                <img className="modalTableImage" src={img} alt={`image ${j + 1}`} />
                            ))
                        )}
                    </div>

                    <input id="closeButton" type="button" value="X" onClick={this.props.handleModal}/>
                </div>
            </div>
        )
    }
}

class Filter extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedTag: "All Tags",
            selectedRating: "All Ratings",
            favouriteOnly: false
        }
    }

    handleFilter = () => {
        const { selectedTag, selectedRating, favouriteOnly } = this.state
        const filtered = this.props.data.filter(item => {
            let matchTag = selectedTag === "All Tags" || (item.tags && item.tags.includes(selectedTag))
            let matchRating = selectedRating === "All Ratings" || item.rating === parseInt(selectedRating)
            let matchFavourite = !favouriteOnly || item.favourite
            return matchTag && matchRating && matchFavourite
        })
        this.props.setStateFilter(filtered)
    }

    render() {
        return (
            <div>
                <label>
                    <select name="tags"
                            value={this.state.selectedTag}
                            onChange={(e) =>
                                this.setState({ selectedTag: e.target.value })}
                    >
                        {this.props.tags.map(tag => <option>{tag}</option>)}
                    </select>
                </label>
                <label>
                    <select name="rating"
                            value={this.state.selectedRating}
                            onChange={(e) =>
                                this.setState({ selectedRating: e.target.value })}
                    >
                        <option value="All Ratings">All Ratings</option>
                        {[1, 2, 3, 4, 5].map(r => <option>{r}</option>)}
                    </select>
                </label>
                <label id="filter_input_label">
                    <input id="filter_input"
                           type="checkbox"
                           checked={this.state.favouriteOnly}
                           onChange={(e) =>
                               this.setState({ favouriteOnly: e.target.checked })}
                    />
                    Favourites only
                </label>
                <button id="filter_button" onClick={this.handleFilter}>Filter</button>
            </div>
        )
    }
}

class Search extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            query: ""
        }
    }

    handleSearch = (e) => {
        let query = e.target.value
        this.setState({ query })
        this.props.onSearch(query)
    }

    render() {
        return (
            <div className="input-group">
                <input className="form-control" type="text" onChange={this.handleSearch}
                       value={this.state.query} placeholder="Search for..." aria-label="Search for..."
                       aria-describedby="btnNavbarSearch"/>
            </div>
        )
    }
}

class Footer extends React.Component {
    render() {
        return (
            <React.Fragment>
                {this.props.links.map(link => (
                    <p id="links">
                        Links:
                        <a href={link.official} target="_blank">Official</a>
                        <a href={link.undp} target="_blank">UNDP</a>
                    </p>
                ))}
            </React.Fragment>
        )
    }
}
