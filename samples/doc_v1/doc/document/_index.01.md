Document is structured as nodes.  
The doc object is the root node.  
Nodes contains child nodes and items.  

```
root
 |-nodes
 |  |-node
 |  |  |-nodes
 |  |  |  |-nodes
 |  |  |  |-items
 |  |  |-items
 |  |     |-item1
 |  |-node
 |     |-nodes
 |     |  |-nodes
 |     |  |-items
 |     |-items
 |        |-item1
 |-items
```


### Node
``` json
node: {
	name: '',               // ReadOnly: File name
	title: '',              // Optional: Title (default: name)
	toc: true,              // Optional: Show in TOC (default: true)
	book: true,             // Optional: Include in Book (default: true)
	url: '/',               // ReadOnly: Node URL
	templates: {            // Optional
		node: '@node',        // Optional: Node template (default: @node)
		items: '@item',       // Optional: Items template (default: @item)
	},
	parent: null,           // ReadOnly: Parent node
	nodes: [],              // ReadOnly: Child nodes
	items: [],              // ReadOnly: Items
	getNode: (name) => {},  // Function: Get child node by name
	getItem: (name) => {},  // Function: Get item by name
}
```

### Item
``` json
item: {
	name: '',      // Optional: Name
	title: '',     // Optional: Title (default: name)
	toc: false,    // Optional: Show in TOC (default: false)
	book: true,    // Optional: Include in Book (default: true)
	url: '',       // ReadOnly: Item URL
	data: {},      // ReadOnly: Item Data
}
```